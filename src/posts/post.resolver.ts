import { Can, AuthorizationService } from '@nestjs/authorization';
import { Public, CurrentUser } from '@nestjs/authentication';
import {
  Args,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types.js';
import { PostService } from './post.service.js';
import { PostPolicy } from './post.policy.js';
import { CreatePostInput, PostType, UpdatePostInput } from './post.model.js';

@Resolver(() => PostType)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Public()
  @Query(() => [PostType])
  async posts(): Promise<PostType[]> {
    return this.postService.findPublished();
  }

  @Public()
  @Query(() => PostType, { nullable: true })
  async post(@Args('id') id: string): Promise<PostType | null> {
    const post = await this.postService.findById(id);

    if (!post) {
      return null;
    }

    return post;
  }

  @Can(PostPolicy, 'create')
  @Mutation(() => PostType)
  async createPost(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreatePostInput,
  ): Promise<PostType> {
    return this.postService.create(user, input);
  }

  @Can(PostPolicy, 'update', (context: any) => [context.getArgs().postId])
  @Mutation(() => PostType)
  async updatePost(
    @Args('postId') postId: string,
    @Args('input') input: UpdatePostInput,
    @CurrentUser() user: AuthUser,
  ): Promise<PostType> {
    const post = await this.postService.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    await this.authorizationService.authorize(PostPolicy, 'update', user, postId);

    return this.postService.update(postId, input);
  }

  @Can(PostPolicy, 'delete', (context: any) => [context.getArgs().postId])
  @Mutation(() => Boolean)
  async deletePost(
    @Args('postId') postId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<boolean> {
    await this.authorizationService.authorize(PostPolicy, 'delete', user, postId);
    return this.postService.remove(postId);
  }

  @Can(PostPolicy, 'manage')
  @Query(() => [PostType])
  async adminPosts(@CurrentUser() user: AuthUser): Promise<PostType[]> {
    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required.');
    }

    return this.postService.findPublished();
  }
}
