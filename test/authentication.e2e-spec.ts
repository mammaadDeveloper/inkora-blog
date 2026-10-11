import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module.js';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Authentication (E2E)', () => {
  let app: INestApplication;

  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();
  });

  afterEach(async () => {});

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should success register operation.', async () => {
    const query = `mutation Register($input:RegisterInput!){
      register(input: $input){
      accessToken
      refreshToken
      user {
      id
      email
      role
      }
      }
    }`;

    const variables = {
      input: {
        email: 'test@email.com',
        password: 'testPassword@12345',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables });

    expect(response.status).toBe(200);
    expect(response.body.data.register).toHaveProperty('accessToken');
    expect(response.body.data.register).toHaveProperty('refreshToken');
    expect(response.body.errors).toBeUndefined();
  });

  it('should success login operation.', async () => {
    const query = `mutation Login($input:SignInInput!){
      login(input: $input){
      accessToken
      refreshToken
      user {
      id
      email
      role
      }
      }
    }`;

    const variables = {
      input: {
        email: 'test@email.com',
        password: 'testPassword@12345',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables });

    expect(response.status).toBe(200);
    expect(response.body.data.login).toHaveProperty('accessToken');
    expect(response.body.data.login).toHaveProperty('refreshToken');
    expect(response.body.errors).toBeUndefined();
  });

  it('should fail login operation.', async () => {
    const query = `
    mutation Login($input: SignInInput!) {
    login (input: $input) {
    accessToken
    refreshToken
    user {
    id
    email
    role}
    }
    `;
    const variables = {
      input: {
        email: 'test@email.com',
        password: 'testPassword',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables });

    expect(response.status).toBe(400);
    expect(response.body.data?.login).toBeUndefined();
  });
});
