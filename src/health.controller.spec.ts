import {
  type HealthCheckResult,
  type HealthCheckStatus,
  type HealthIndicatorFunction,
  type HealthIndicatorResult,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { type TestingModule, Test } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import { HealthController } from '~app/health.controller';

function getStatus(key: string): Promise<HealthIndicatorResult> {
  return Promise.resolve({ [key]: { status: 'up' } });
}

function reduceResults(
  results: Array<HealthIndicatorResult>,
): HealthIndicatorResult {
  const summary: HealthIndicatorResult = {};

  for (const result of results) {
    Object.assign(summary, result);
  }

  return summary;
}

async function checkHealthIndicators(
  indicators: Array<HealthIndicatorFunction>,
): Promise<HealthCheckResult> {
  const success: Array<HealthIndicatorResult> = [];
  const errors: Array<HealthIndicatorResult> = [];
  const results = await Promise.allSettled(
    indicators.map((indicator) => indicator()),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      success.push(result.value);
    } else {
      errors.push(result.reason as HealthIndicatorResult);
    }
  }

  const status = (errors.length > 0 ? 'error' : 'ok') as HealthCheckStatus;
  const info = reduceResults(success);
  const error = reduceResults(errors);
  const details = reduceResults([...success, ...errors]);

  return {
    status,
    info,
    error,
    details,
  };
}

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    })
      .useMocker((token) => {
        if (token === HealthCheckService) {
          return createMock<HealthCheckService>({
            check: jest.fn().mockImplementation(checkHealthIndicators),
          });
        }

        if (token === TypeOrmHealthIndicator) {
          return createMock<TypeOrmHealthIndicator>({
            pingCheck: jest.fn().mockImplementation(getStatus),
          });
        }

        if (token === MemoryHealthIndicator) {
          return createMock<MemoryHealthIndicator>({
            checkHeap: jest.fn().mockImplementation(getStatus),
            checkRSS: jest.fn().mockImplementation(getStatus),
          });
        }

        return;
      })
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be an instance of HealthController', () => {
    expect(controller).toBeInstanceOf(HealthController);
  });

  it('should check the health', async () => {
    await expect(
      controller.healthCheck(),
    ).resolves.toMatchObject<HealthCheckResult>({
      details: {
        database: { status: 'up' },
        mem_heap: { status: 'up' },
        mem_rss: { status: 'up' },
      },
      error: {},
      info: {
        database: { status: 'up' },
        mem_heap: { status: 'up' },
        mem_rss: { status: 'up' },
      },
      status: 'ok',
    });
  });
});
