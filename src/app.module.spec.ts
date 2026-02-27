import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken, getConnectionToken } from '@nestjs/sequelize';
import { Vehicle } from './vehicles/models/vehicle.entity';

jest.mock('cache-manager-redis-yet', () => ({
  redisStore: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    mget: jest.fn(),
    mset: jest.fn(),
    mdel: jest.fn(),
    keys: jest.fn(),
    ttl: jest.fn(),
    reset: jest.fn(),
    on: jest.fn(),
    client: {
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    },
  }),
}));

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        store: { client: { quit: jest.fn() } },
      })
      .overrideProvider(getModelToken(Vehicle))
      .useValue({ findAll: jest.fn() })
      .overrideProvider(getConnectionToken())
      .useValue({
        close: jest.fn().mockResolvedValue(true),
        authenticate: jest.fn().mockResolvedValue(true),
      })
      .compile();
  });

  it('debería estar definido', () => {
    expect(module).toBeDefined();
  });

  afterAll(async () => {
    if (module) {
      const sequelize = module.get(getConnectionToken());
      await sequelize.close();
      await module.close();
    }
  });
});
