import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { applyChannelScope } from '../common/utils/channel-scope.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Orders (Guest checkout — no userId required) ──────────────────────

  /**
   * Tạo đơn hàng mới. channelId được inject từ ApiKeyGuard.
   * Không cần userId (guest checkout).
   */
  async createOrder(channelId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Fetch variants and validate stock/channel
    const resolvedItems: {
      variant: ProductVariant;
      product: Product;
      quantity: number;
      unitPrice: number;
    }[] = [];

    for (const line of dto.items) {
      const variant = await this.variantRepo.findOne({
        where: { id: line.variantId },
        relations: ['product'],
      });

      if (!variant) {
        throw new NotFoundException(
          `Variant #${line.variantId} not found`,
        );
      }

      if (!variant.isActive) {
        throw new BadRequestException(
          `Variant ${variant.color}/${variant.size} is not available`,
        );
      }

      if (!variant.product || variant.product.channelId !== channelId) {
        throw new NotFoundException(`Variant #${line.variantId} not found in this channel`);
      }

      if (!variant.product.isActive) {
        throw new BadRequestException(`Product "${variant.product.name}" is not available`);
      }

      if (variant.stock < line.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${variant.product.name}" (${variant.color}/${variant.size}). Available: ${variant.stock}`,
        );
      }

      if (line.productId && line.productId !== variant.productId) {
        throw new BadRequestException(`productId does not match variantId for line ${line.variantId}`);
      }

      const unitPrice = Number(variant.product.price);
      resolvedItems.push({
        variant,
        product: variant.product,
        quantity: line.quantity,
        unitPrice,
      });
    }

    // Calculate financials
    const subtotal = resolvedItems.reduce(
      (sum, line) => sum + Number(line.unitPrice) * line.quantity,
      0,
    );

    // Free shipping HCM (provinceCode '79'): 30,000 VND; others: 50,000 VND
    const shippingFee = dto.customerInfo.provinceCode === '79' ? 30000 : 50000;
    const totalPrice = subtotal + shippingFee;

    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        channelId,
        userId: undefined,   // guest checkout
        status: undefined,   // DB default: PENDING
        customerInfo: dto.customerInfo,
        paymentMethod: dto.paymentMethod,
        shopeeOrderId: dto.shopeeOrderId,
        subtotal,
        shippingFee,
        totalPrice,
        items: resolvedItems.map(({ variant, product, quantity, unitPrice }) => {
          return manager.create(OrderItem, {
            productId: product.id,
            variantId: variant.id,
            quantity,
            price: unitPrice,
            productName: product.name,
            productImage: variant.imageUrl ?? product.images?.[0] ?? '',
            sku: variant.sku,
            selectedSize: variant.size,
            selectedColor: variant.color,
          });
        }),
      });
      const savedOrder = await manager.save(Order, order);

      // Decrement variant stock and increment sold count
      for (const { variant, quantity } of resolvedItems) {
        await manager.decrement(
          ProductVariant,
          { id: variant.id },
          'stock',
          quantity,
        );
        await manager.increment(
          Product,
          { id: variant.productId },
          'soldCount',
          quantity,
        );
      }

      // Sync product.stock = SUM(variant.stock)
      const productIds = [...new Set(resolvedItems.map((i) => i.variant.productId))];
      for (const productId of productIds) {
        const result = await manager
          .createQueryBuilder(ProductVariant, 'v')
          .select('COALESCE(SUM(v.stock), 0)', 'total')
          .where('v.productId = :productId', { productId })
          .getRawOne<{ total: string }>();

        await manager.update(Product, { id: productId }, { stock: Number(result?.total ?? 0) });
      }

      return savedOrder;
    });
  }

  /**
   * Lookup đơn hàng theo SĐT — cho storefront guest lookup.
   * channelId bắt buộc để tránh lộ data channel khác.
   */
  async lookupByPhone(channelId: string, phone: string) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.channelId = :channelId', { channelId });

    // customerInfo là JSON column — dùng JSON operator
    qb.andWhere(`"order"."customerInfo"::jsonb->>'phone' = :phone`, { phone });

    return qb.orderBy('order.createdAt', 'DESC').getMany();
  }

  // ── Admin ────────────────────────────────────────────────────────────

  /**
   * List tất cả orders.
   * channelId = null → Super Admin, thấy tất cả channels.
   */
  async getAllOrders(channelId: string | null) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.channel', 'channel');

    applyChannelScope(qb, 'order', channelId);

    return qb.orderBy('order.createdAt', 'DESC').getMany();
  }

  async getOrderById(id: string, channelId: string | null) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.channel', 'channel')
      .where('order.id = :id', { id });

    applyChannelScope(qb, 'order', channelId);

    const order = await qb.getOne();
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto, channelId: string | null) {
    const order = await this.getOrderById(id, channelId);
    order.status = dto.status;
    return this.orderRepo.save(order);
  }
}
