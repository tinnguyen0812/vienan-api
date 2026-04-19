import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { applyChannelScope } from '../common/utils/channel-scope.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  /**
   * List sản phẩm — tự động filter theo channel.
   * channelId = null (Super Admin) → thấy tất cả channels.
   */
  async findAll(filters: FilterProductDto, channelId: string | null) {
    const { search, categoryId, page = 1, limit = 20 } = filters;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    // Channel scope
    applyChannelScope(qb, 'product', channelId);

    if (search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }
    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    const [items, total] = await qb
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, channelId: string | null) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);

    // Channel scope check
    if (channelId !== null && product.channelId !== channelId) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    const variants = await this.variantRepo.find({
      where: { productId: id, isActive: true },
      order: { color: 'ASC', size: 'ASC' },
    });

    const variantSummary = {
      count: variants.length,
      sizes: [...new Set(variants.map((v) => v.size))],
      colors: [...new Set(variants.map((v) => v.color))],
      totalStock: variants.reduce((sum, v) => sum + Number(v.stock || 0), 0),
      hasVariants: variants.length > 0,
    };

    return {
      ...product,
      variantSummary,
    };
  }

  async create(dto: CreateProductDto, channelId: string) {
    const product = this.productRepo.create({ ...dto, channelId });
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto, channelId: string | null) {
    await this.findOne(id, channelId);
    await this.productRepo.update(id, dto as any);
    return this.findOne(id, channelId);
  }

  async remove(id: string, channelId: string | null) {
    const product = await this.findOne(id, channelId);
    return this.productRepo.remove(product);
  }
}
