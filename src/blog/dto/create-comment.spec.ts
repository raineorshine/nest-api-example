import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { isUUID, useContainer, validate } from 'class-validator';
import fc from 'fast-check';
import { createMock } from 'ts-auto-mock';

import { CreateComment } from '~blog/dto/create-comment';
import { ArticleService } from '~blog/services/article.service';
import { ArticleExistConstraint } from '~blog/validators/article-exist.validator';

describe('CreateComment DTO', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ArticleExistConstraint],
    })
      .useMocker((token) => {
        if (token === ArticleService) {
          return createMock<ArticleService>({
            checkExist: jest
              .fn()
              .mockImplementation((articleId: string) =>
                Promise.resolve(isUUID(articleId)),
              ),
          });
        }

        return;
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should pass with valid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record({
            body: fc.string({ minLength: 1 }),
            article: fc.uuidV(4),
          })
          .map((data) => plainToInstance(CreateComment, data)),
        async (data) => {
          const errors = await validate(data);

          expect(errors).toHaveLength(0);
        },
      ),
    );
  });

  it('should fail with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .record({
            body: fc.oneof(fc.nat(), fc.constant('')),
            article: fc.string(),
          })
          .map((data) => plainToInstance(CreateComment, data)),
        async (data) => {
          const errors = await validate(data);

          expect(errors.length).toBeGreaterThanOrEqual(1);
        },
      ),
    );
  });
});
