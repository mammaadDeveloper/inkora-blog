import { Public } from '@nestjs/authentication';
import { Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service.js';

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Query(() => String, {
    name: 'health',
    description: 'Returns the current application health status.',
  })
  health(): string {
    return this.appService.getHealth();
  }
}
