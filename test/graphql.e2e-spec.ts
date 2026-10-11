import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('GraphQL health query', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the health status', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/graphql',
      payload: {
        query: '{ health }',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.health).toBe('Inkora backend is healthy.');
  });
});
