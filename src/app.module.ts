import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import type { FastifyRequest } from 'fastify';
import { join } from 'node:path';
import { AuthModule } from './auth/auth.module.js';
import { AppResolver } from './app.resolver.js';
import { AppService } from './app.service.js';
import { validateEnvironment } from './config/env.validation.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PostsModule } from './posts/post.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validate: validateEnvironment,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ApolloDriverConfig => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const isDevelopment = nodeEnv !== 'production';

        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: false,
          introspection: isDevelopment,
          graphiql: isDevelopment,
          csrfPrevention: false,
          fieldResolverEnhancers: ['guards', 'interceptors'],
          context: ({ req, res }: { req: FastifyRequest; res: unknown }) => ({
            req,
            res,
          }),
        };
      },
    }),
    PrismaModule,
    AuthModule,
    PostsModule,
  ],
  providers: [AppResolver, AppService],
})
export class AppModule {}
