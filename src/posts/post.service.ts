import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/auth.types.js';
import { UserRole } from '../auth/auth.types.js';
import { CreatePostInput, PostType, UpdatePostInput } from './post.model.js';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(): Promise<PostType[]> {
    return this.prisma.post.findMany({
      where: { published: true },
      include: {
        author: true,
      },
    }) as Promise<PostType[]>;
  }

  async findById(id: string): Promise<PostType | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
      },
    }) as Promise<PostType | null>;
  }

  async create(user: AuthUser, input: CreatePostInput): Promise<PostType> {
    return this.prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        published: Boolean(input.published),
        authorId: user.id,
      },
      include: {
        author: true,
      },
    }) as Promise<PostType>;
  }

  async update(postId: string, input: UpdatePostInput): Promise<PostType> {
    const existing = await this.findById(postId);

    if (!existing) {
      throw new NotFoundException('Post not found.');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        title: input.title ?? existing.title,
        content: input.content ?? existing.content,
        published: input.published ?? existing.published,
      },
      include: {
        author: true,
      },
    }) as Promise<PostType>;
  }

  async remove(postId: string): Promise<boolean> {
    const existing = await this.findById(postId);

    if (!existing) {
      throw new NotFoundException('Post not found.');
    }

    await this.prisma.post.delete({ where: { id: postId } });
    return true;
  }

  async canRead(user: AuthUser | null, post: PostType): Promise<boolean> {
    if (post.published) {
      return true;
    }

    return Boolean(
      user && (user.role === UserRole.ADMIN || post.author.id === user.id),
    );
  }

  async canModify(user: AuthUser | null, postId: string): Promise<boolean> {
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const post = await this.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    return user.role === UserRole.ADMIN || post.author.id === user.id;
  }
}
