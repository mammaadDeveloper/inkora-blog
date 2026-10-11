import { Field, ID, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: AuthUser;
  }
}

@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field(() => UserRole)
  role!: UserRole;
}

@ObjectType()
export class AuthTokens {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => UserType)
  user!: UserType;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsNotEmpty()
  @IsStrongPassword()
  password!: string;
}

@InputType()
export class SignInInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  refreshToken!: string;
}
