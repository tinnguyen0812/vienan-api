import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { BadRequestException } from '@nestjs/common';

import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if Super Admin (no channelId in req) does not provide channelId in DTO', () => {
      const dto: CreateProductDto = { name: 'Test', price: 100, categoryId: 'uuid' };
      const req = { user: { channelId: null } };

      expect(() => controller.create(dto, req)).toThrow(BadRequestException);
    });

    it('should call service.create if Super Admin provides channelId in DTO', () => {
      const dto: CreateProductDto = { name: 'Test', price: 100, categoryId: 'uuid', channelId: 'channel-uuid' };
      const req = { user: { channelId: null } };

      controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, 'channel-uuid');
    });

    it('should use req.user.channelId if present (Channel Admin)', () => {
      const dto: CreateProductDto = { name: 'Test', price: 100, categoryId: 'uuid' };
      const req = { user: { channelId: 'admin-channel-uuid' } };

      controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, 'admin-channel-uuid');
    });
  });
});
