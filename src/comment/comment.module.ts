import { Module } from '@nestjs/common';
import { CommentService } from './comment.service.js';
import { CommentResolver } from './comment.resolver.js';

@Module({
  providers: [CommentResolver, CommentService],
})
export class CommentModule {}
