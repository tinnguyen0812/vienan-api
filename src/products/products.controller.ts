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
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

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
  findAll(@Query() filters: FilterProductDto, @Req() req: any) {
    return this.productsService.findAll(filters, req.channelId);
  }

  /**
   * GET /products/:id
   * Public storefront: trả single product theo channel.
   */
  @Get(':id')
  @UseGuards(ApiKeyGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.productsService.findOne(id, req.channelId);
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
  findAllAdmin(@Query() filters: FilterProductDto, @Req() req: any) {
    const channelId: string | null = req.user.channelId ?? null;
    return this.productsService.findAll(filters, channelId);
  }

  /**
   * GET /products/admin/:id
   * Admin dashboard: get single product bằng JWT.
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const channelId: string | null = req.user.channelId ?? null;
    return this.productsService.findOne(id, channelId);
  }

  /**
   * POST /products
   * Tạo sản phẩm cho channel của admin đang đăng nhập.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() dto: CreateProductDto, @Req() req: any) {
    const channelId: string = req.user.channelId ?? dto.channelId;
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
    @Req() req: any,
  ) {
    return this.productsService.update(id, dto, req.user.channelId ?? null);
  }

  /**
   * DELETE /products/:id
   * Channel Admin chỉ xóa được product của channel mình.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.productsService.remove(id, req.user.channelId ?? null);
  }
}
