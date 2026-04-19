import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { Channel } from '../channels/entities/channel.entity';
import { LoginDto } from './dto/login.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
    private readonly jwtService: JwtService,
  ) {}

  // ── Admin Login ───────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      throw new UnauthorizedException('Invalid credentials or insufficient role');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      channelId: user.channelId ?? null,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        channelId: user.channelId ?? null,
      },
    };
  }

  // ── API Key Management (Admin only) ──────────────────────────────

  async createApiKey(dto: CreateApiKeyDto) {
    const channel = await this.channelRepo.findOne({ where: { id: dto.channelId } });
    if (!channel) throw new NotFoundException(`Channel #${dto.channelId} not found`);

    const key = crypto.randomBytes(32).toString('hex');
    const apiKey = this.apiKeyRepo.create({
      key,
      label: dto.label ?? '',
      channelId: dto.channelId,
    });
    return this.apiKeyRepo.save(apiKey);
  }

  async listApiKeys() {
    return this.apiKeyRepo.find({ relations: ['channel'] });
  }

  async revokeApiKey(id: string) {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id } });
    if (!apiKey) throw new NotFoundException(`API key #${id} not found`);
    apiKey.isActive = false;
    return this.apiKeyRepo.save(apiKey);
  }

  async deleteApiKey(id: string) {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id } });
    if (!apiKey) throw new NotFoundException(`API key #${id} not found`);
    return this.apiKeyRepo.remove(apiKey);
  }
}
