import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { UserType } from '../auth/auth.types.js';

@ObjectType()
export class PostType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field()
  published!: boolean;

  @Field(() => UserType)
  author!: UserType;
}

@InputType()
export class CreatePostInput {
  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field({ nullable: true, defaultValue: false })
  published?: boolean;
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  published?: boolean;
}
