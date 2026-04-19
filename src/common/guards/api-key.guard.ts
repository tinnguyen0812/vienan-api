import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../auth/entities/api-key.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'] as string;

    if (!key) {
      throw new UnauthorizedException('API key missing (X-Api-Key header)');
    }

    const apiKey = await this.apiKeyRepo.findOne({
      where: { key },
      relations: ['channel'],
    });

    if (!apiKey || !apiKey.isActive) {
      throw new UnauthorizedException('Invalid or inactive API key');
    }

    if (!apiKey.channel || !apiKey.channel.isActive) {
      throw new UnauthorizedException('Channel is inactive');
    }

    // Attach channel context — dùng trong controllers qua req.channelId
    request.channelId = apiKey.channelId;
    request.channel   = apiKey.channel;
    request.user      = null; // không còn customer auth
    request.apiKey    = apiKey;

    return true;
  }
}
