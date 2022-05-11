import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import invariant from 'tiny-invariant';

import { Article } from '@/blog/entities/article.entity';
import { ArticleService } from '@/blog/services/article.service';

@Injectable()
export class IsAuthorGuard implements CanActivate {
  constructor(private articleService: ArticleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const article = await this.articleService.getById(
      Article.extractId(request.params.id),
    );

    if (!article) return true;

    // The request.user is defined and checked by JWTAuthGuard
    invariant(request.user, 'Must be logged in');

    if (article.author.id !== request.user.id) {
      throw new ForbiddenException('You are not the author of the article');
    }

    return true;
  }
}