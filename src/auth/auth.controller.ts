import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Admin login — returns JWT
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ── API Key endpoints (Super Admin only) ───────────────────────

  /**
   * POST /auth/api-keys
   * Admin: generate a new API key (optionally linked to a user)
   */
  @Post('api-keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  createApiKey(@Body() dto: CreateApiKeyDto) {
    return this.authService.createApiKey(dto);
  }

  /**
   * GET /auth/api-keys
   * Admin: list all API keys
   */
  @Get('api-keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  listApiKeys() {
    return this.authService.listApiKeys();
  }

  /**
   * PATCH /auth/api-keys/:id/revoke
   * Admin: deactivate an API key
   */
  @Patch('api-keys/:id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  revokeApiKey(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.revokeApiKey(id);
  }

  /**
   * DELETE /auth/api-keys/:id
   * Admin: delete an API key permanently
   */
  @Delete('api-keys/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  deleteApiKey(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.deleteApiKey(id);
  }
}
