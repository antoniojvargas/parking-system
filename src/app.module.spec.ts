import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/sequelize';
import { Vehicle } from './vehicles/models/vehicle.entity';
import { Sequelize } from 'sequelize';
import { getConnectionToken } from '@nestjs/sequelize';

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue({ get: jest.fn(), set: jest.fn(), del: jest.fn() })
      .overrideProvider(getModelToken(Vehicle))
      .useValue({ findAll: jest.fn() })
      .overrideProvider(getConnectionToken())
      .useValue({
        close: jest.fn(),
        authenticate: jest.fn(),
      } as Partial<Sequelize>)
      .compile();
  });

  it('debería estar definido', () => {
    expect(module).toBeDefined();
  });

  afterAll(async () => {
    const sequelize = module.get<Sequelize>(getConnectionToken());
    await sequelize.close();
    await module.close();
  });
});
