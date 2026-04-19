import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Storefront (API Key) ────────────────────────────────────────────────

  /**
   * POST /orders
   * Guest checkout — không cần login.
   * channelId được inject tự động từ API key.
   */
  @Post('orders')
  @UseGuards(ApiKeyGuard)
  createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.channelId, dto);
  }

  /**
   * GET /orders/lookup?phone=09xx
   * Tra cứu đơn hàng theo SĐT — không cần login.
   * Chỉ trả đơn của channel tương ứng API key.
   */
  @Get('orders/lookup')
  @UseGuards(ApiKeyGuard)
  lookupByPhone(@Req() req: any, @Query('phone') phone: string) {
    return this.ordersService.lookupByPhone(req.channelId, phone);
  }

  // ── Admin (JWT) ────────────────────────────────────────────────────────

  /**
   * GET /admin/orders
   * Channel Admin: chỉ thấy orders của channel mình.
   * Super Admin: thấy tất cả (channelId = null).
   */
  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getAllOrders(@Req() req: any) {
    return this.ordersService.getAllOrders(req.user.channelId ?? null);
  }

  /**
   * GET /admin/orders/:id
   */
  @Get('admin/orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getOrderById(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.getOrderById(id, req.user.channelId ?? null);
  }

  /**
   * PATCH /admin/orders/:id/status
   * Channel Admin cập nhật status — chỉ của channel mình.
   */
  @Patch('admin/orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.ordersService.updateOrderStatus(id, dto, req.user.channelId ?? null);
  }
}
