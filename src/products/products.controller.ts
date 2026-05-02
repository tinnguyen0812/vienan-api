import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Client endpoints (API Key) — channel auto-detected from key ──────────

  /**
   * GET /products
   * Public storefront: trả sản phẩm của channel theo API key.
   */
  @Get()
  @UseGuards(ApiKeyGuard)
  findAll(@Query() filters: FilterProductDto, @Req() req: RequestWithUser) {
    return this.productsService.findAll(filters, req.channelId ?? null);
  }

  /**
   * GET /products/:id
   * Public storefront: trả single product theo channel.
   */
  @Get(':id')
  @UseGuards(ApiKeyGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    return this.productsService.findOne(id, req.channelId ?? null);
  }

  // ── Admin endpoints (JWT) ─────────────────────────────────────────────────

  /**
   * GET /products/admin/list
   * Admin dashboard: list sản phẩm bằng JWT (không cần API key).
   * Super Admin thấy tất cả channel; Channel Admin thấy channel của mình.
   */
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findAllAdmin(@Query() filters: FilterProductDto, @Req() req: RequestWithUser) {
    const channelId: string | null = req.user?.channelId ?? null;
    return this.productsService.findAll(filters, channelId);
  }

  /**
   * GET /products/admin/:id
   * Admin dashboard: get single product bằng JWT.
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    const channelId: string | null = req.user?.channelId ?? null;
    return this.productsService.findOne(id, channelId);
  }

  /**
   * POST /products
   * Tạo sản phẩm cho channel của admin đang đăng nhập.
   * Super Admin phải truyền channelId trong body.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() dto: CreateProductDto, @Req() req: RequestWithUser) {
    const channelId: string | undefined | null = req.user?.channelId ?? dto.channelId;
    if (!channelId) {
      throw new BadRequestException('channelId is required for Super Admin');
    }
    return this.productsService.create(dto, channelId);
  }

  /**
   * PATCH /products/:id
   * Channel Admin chỉ sửa được product của channel mình.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: RequestWithUser,
  ) {
    const channelId: string | null = req.user?.channelId ?? null;
    return this.productsService.update(id, dto, channelId);
  }

  /**
   * DELETE /products/:id
   * Channel Admin chỉ xóa được product của channel mình.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    return this.productsService.remove(id, req.user?.channelId ?? null);
  }
}
