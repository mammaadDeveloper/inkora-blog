import { CurrentUser, Public } from '@nestjs/authentication';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service.js';
import type { AuthUser } from './auth.types.js';
import {
  AuthTokens,
  RefreshTokenInput,
  RegisterInput,
  SignInInput,
  UserType,
} from './auth.types.js';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthTokens, { name: 'register' })
  async register(@Args('input') input: RegisterInput): Promise<AuthTokens> {
    return this.authService.register(input);
  }

  @Public()
  @Mutation(() => AuthTokens, { name: 'login' })
  async signIn(@Args('input') input: SignInInput): Promise<AuthTokens> {
    return this.authService.signIn(input);
  }

  @Public()
  @Mutation(() => AuthTokens)
  async refreshTokens(
    @Args('input') input: RefreshTokenInput,
  ): Promise<AuthTokens> {
    return this.authService.refreshTokens(input.refreshToken);
  }

  @Public()
  @Mutation(() => Boolean)
  async signOut(
    @Args('input') input: RefreshTokenInput,
  ): Promise<boolean> {
    return this.authService.signOut(input.refreshToken);
  }

  @Public()
  @Query(() => UserType)
  async me(@CurrentUser() user: AuthUser): Promise<AuthUser> {
    return this.authService.me(user);
  }
}
