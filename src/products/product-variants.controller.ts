import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiKeyOrJwtGuard } from '../common/guards/api-key-or-jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ProductVariantsService } from './product-variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { BulkCreateVariantsDto } from './dto/bulk-create-variants.dto';

@Controller('products/:productId/variants')
export class ProductVariantsController {
  constructor(private readonly variantsService: ProductVariantsService) {}

  /**
   * GET /products/:id/variants
   * Public (ApiKey) for storefront OR JWT for admin dashboard.
   * ApiKeyOrJwtGuard handles both auth methods.
   */
  @Get()
  @UseGuards(ApiKeyOrJwtGuard)
  findAll(@Param('productId', ParseUUIDPipe) productId: string, @Req() req: any) {
    // ApiKey path: req.channelId set by guard
    // JWT path: req.user.channelId (null = super admin sees all)
    const channelId: string | null = req.channelId ?? req.user?.channelId ?? null;
    return this.variantsService.findAll(productId, channelId);
  }

  /** Admin-only write operations — require JWT */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateVariantDto,
    @Req() req: any,
  ) {
    return this.variantsService.create(productId, req.user.channelId ?? null, dto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  bulkCreate(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: BulkCreateVariantsDto,
    @Req() req: any,
  ) {
    return this.variantsService.bulkCreate(productId, req.user.channelId ?? null, dto);
  }

  @Patch(':variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateVariantDto,
    @Req() req: any,
  ) {
    return this.variantsService.update(productId, variantId, req.user.channelId ?? null, dto);
  }

  @Delete(':variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Req() req: any,
  ) {
    return this.variantsService.remove(productId, variantId, req.user.channelId ?? null);
  }
}