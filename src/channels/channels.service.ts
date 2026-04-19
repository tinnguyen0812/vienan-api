import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this.channelRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string): Promise<Channel> {
    const channel = await this.channelRepo.findOne({ where: { id } });
    if (!channel) throw new NotFoundException(`Channel #${id} not found`);
    return channel;
  }

  async create(dto: CreateChannelDto): Promise<Channel> {
    const existing = await this.channelRepo.findOne({
      where: [{ name: dto.name }, { slug: dto.slug }],
    });
    if (existing) throw new ConflictException('Channel name or slug already exists');

    const channel = this.channelRepo.create(dto);
    return this.channelRepo.save(channel);
  }

  async update(id: string, dto: UpdateChannelDto): Promise<Channel> {
    await this.findOne(id);
    await this.channelRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const channel = await this.findOne(id);
    await this.channelRepo.remove(channel);
  }
}
