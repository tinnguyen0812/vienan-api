import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { BulkCreateVariantsDto } from './dto/bulk-create-variants.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private async getProduct(productId: string, channelId: string | null): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);
    if (channelId !== null && product.channelId !== channelId) {
      throw new NotFoundException(`Product #${productId} not found`);
    }
    return product;
  }

  private generateSku(productSlug: string, color: string, size: string): string {
    const colorSlug = slugify(color).substring(0, 6).toUpperCase();
    return `${(productSlug || 'PROD').substring(0, 8).toUpperCase()}-${colorSlug}-${size.toUpperCase()}`;
  }

  async findAll(productId: string, channelId: string | null): Promise<ProductVariant[]> {
    await this.getProduct(productId, channelId);
    return this.variantRepo.find({
      where: { productId },
      order: { color: 'ASC', size: 'ASC' },
    });
  }

  async create(productId: string, channelId: string | null, dto: CreateVariantDto): Promise<ProductVariant> {
    const product = await this.getProduct(productId, channelId);

    const sku = dto.sku || this.generateSku(product.slug || product.name, dto.color, dto.size);
    const existingSku = await this.variantRepo.findOne({ where: { sku } });
    if (existingSku) {
      throw new ConflictException(`SKU ${sku} already exists`);
    }

    const existing = await this.variantRepo.findOne({
      where: { productId, size: dto.size, color: dto.color },
    });
    if (existing) {
      throw new ConflictException(`Variant ${dto.color}/${dto.size} already exists for this product`);
    }

    const variant = this.variantRepo.create({
      ...dto,
      productId,
      sku,
      stock: dto.stock ?? 0,
    });
    const saved = await this.variantRepo.save(variant);

    await this.syncProductStock(productId);
    return saved;
  }

  async bulkCreate(productId: string, channelId: string | null, dto: BulkCreateVariantsDto) {
    await this.getProduct(productId, channelId);

    const results: ProductVariant[] = [];
    const errors: Array<{ variant: string; error: string }> = [];

    for (const variantDto of dto.variants) {
      try {
        const result = await this.create(productId, channelId, variantDto);
        results.push(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        errors.push({
          variant: `${variantDto.color}/${variantDto.size}`,
          error: message,
        });
      }
    }

    await this.syncProductStock(productId);
    return { created: results.length, errors };
  }

  async update(productId: string, variantId: string, channelId: string | null, dto: UpdateVariantDto) {
    await this.getProduct(productId, channelId);
    const variant = await this.variantRepo.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException(`Variant #${variantId} not found`);

    Object.assign(variant, dto);
    const saved = await this.variantRepo.save(variant);

    await this.syncProductStock(productId);
    return saved;
  }

  async remove(productId: string, variantId: string, channelId: string | null) {
    await this.getProduct(productId, channelId);
    const variant = await this.variantRepo.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException(`Variant #${variantId} not found`);
    await this.variantRepo.remove(variant);
    await this.syncProductStock(productId);
  }

  async getVariantSummary(productId: string) {
    const variants = await this.variantRepo.find({
      where: { productId, isActive: true },
      order: { color: 'ASC', size: 'ASC' },
    });

    const sizes = [...new Set(variants.map((v) => v.size))];
    const colors = [...new Set(variants.map((v) => v.color))];
    const totalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);

    return {
      count: variants.length,
      sizes,
      colors,
      totalStock,
      hasVariants: variants.length > 0,
    };
  }

  async syncProductStock(productId: string) {
    const result = await this.variantRepo
      .createQueryBuilder('v')
      .select('COALESCE(SUM(v.stock), 0)', 'total')
      .where('v.productId = :productId', { productId })
      .getRawOne<{ total: string }>();

    const total = Number(result?.total ?? 0);
    await this.productRepo.update(productId, { stock: total });
  }
}