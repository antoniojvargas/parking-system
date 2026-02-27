import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './models/vehicle.entity';
import { NotFoundException } from '@nestjs/common';

describe('VehiclesService', () => {
  let service: VehiclesService;
  // let model: typeof Vehicle;

  // Mock del modelo de Sequelize
  const mockVehicleModel = {
    findByPk: jest.fn(),
  };

  // Mock del Cache Manager
  const mockCacheManager = {
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getModelToken(Vehicle),
          useValue: mockVehicleModel,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    // model = module.get<typeof Vehicle>(getModelToken(Vehicle));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('registerExit', () => {
    it('debería calcular el costo correctamente para 1 hora ($2)', async () => {
      const entryTime = new Date();
      entryTime.setHours(entryTime.getHours() - 1); // Hace 1 hora

      const mockVehicle = {
        plate: 'ABC-123',
        status: 'parked',
        entryTime: entryTime,
        getDataValue: jest.fn((key) => {
          if (key === 'entryTime') return entryTime;
          if (key === 'status') return 'parked';
          if (key === 'plate') return 'ABC-123';
        }),
        update: jest.fn().mockResolvedValue(true),
      };

      mockVehicleModel.findByPk.mockResolvedValue(mockVehicle);

      const result = await service.registerExit('some-uuid');

      expect(result.totalHours).toBe(1);
      expect(result.totalCost).toBe('$2');
      expect(mockVehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'exited' }),
      );
    });

    it('debería lanzar NotFoundException si el vehículo no existe', async () => {
      mockVehicleModel.findByPk.mockResolvedValue(null);

      await expect(service.registerExit('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
