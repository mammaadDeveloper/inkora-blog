import { Injectable } from '@nestjs/common';
import { Policy } from '@nestjs/authorization';
import { PostService } from './post.service.js';
import type { AuthUser } from '../auth/auth.types.js';
import { UserRole } from '../auth/auth.types.js';

@Policy()
@Injectable()
export class PostPolicy {
  constructor(private readonly postService: PostService) {}

  async read(user: AuthUser | null, post: { published: boolean; authorId?: string; author?: { id?: string } }): Promise<boolean> {
    if (post.published) {
      return true;
    }

    if (!user) {
      return false;
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    return post.authorId === user.id || post.author?.id === user.id;
  }

  async create(user: AuthUser | null): Promise<boolean> {
    return Boolean(user);
  }

  async update(user: AuthUser | null, postId: string): Promise<boolean> {
    if (!user) {
      return false;
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const post = await this.postService.findById(postId);
    return Boolean(post && post.author.id === user.id);
  }

  async delete(user: AuthUser | null, postId: string): Promise<boolean> {
    return this.update(user, postId);
  }

  async manage(user: AuthUser | null): Promise<boolean> {
    return Boolean(user && user.role === UserRole.ADMIN);
  }
}
