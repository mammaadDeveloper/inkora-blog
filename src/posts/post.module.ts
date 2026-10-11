import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver.js';
import { PostService } from './post.service.js';
import { PostPolicy } from './post.policy.js';

@Module({
  providers: [PostService, PostPolicy, PostResolver],
  exports: [PostService],
})
export class PostsModule {}
