import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../auth/entities/api-key.entity';

/**
 * ApiKeyOrJwtGuard
 * ──────────────────────────────────────────────────────────────
 * Accepts EITHER a valid X-Api-Key header (storefront) OR a valid
 * Bearer JWT (admin dashboard). Whichever is present and valid wins.
 *
 * - ApiKey path: sets req.channelId, req.channel (same as ApiKeyGuard)
 * - JWT path:    sets req.user (same as JwtAuthGuard)
 * - Neither:     throws 401
 */
@Injectable()
export class ApiKeyOrJwtGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // ── Try API Key first ────────────────────────────────────────
    const apiKeyHeader = request.headers['x-api-key'] as string | undefined;
    if (apiKeyHeader) {
      const apiKey = await this.apiKeyRepo.findOne({
        where: { key: apiKeyHeader },
        relations: ['channel'],
      });
      if (apiKey?.isActive && apiKey.channel?.isActive) {
        request.channelId = apiKey.channelId;
        request.channel   = apiKey.channel;
        request.apiKey    = apiKey;
        return true;
      }
    }

    // ── Try JWT Bearer ───────────────────────────────────────────
    const authHeader = request.headers['authorization'] as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify(token);
        request.user = payload;
        // For admin: channelId might be null (super admin sees all)
        request.channelId = payload.channelId ?? null;
        return true;
      } catch {
        // Invalid JWT — fall through to throw below
      }
    }

    throw new UnauthorizedException('Provide a valid X-Api-Key or Bearer token');
  }
}
