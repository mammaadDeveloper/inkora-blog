import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module.js';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Authentication (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
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

      console.log(response);
      

    expect(response.status).toBe(200);
    expect(response.body.data.register).toHaveProperty('accessToken');
    expect(response.body.data.register).toHaveProperty('refreshToken');
    expect(response.body.errors).toBeUndefined();
  });

});
