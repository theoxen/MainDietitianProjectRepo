using API.Common;
using API.Data;
using API.Helpers;
using API.Models.Articles;
using API.Repositories.IRepositories;
using API.Services.IServices;

namespace API.Services
{
    public class ArticleService : IArticleService
    {
        private readonly IArticleRepository _articleRepository;

        public ArticleService(IArticleRepository articleRepository)
        {
            _articleRepository = articleRepository;
        }

        public async Task<Result<Empty>> CreateArticleAsync(CreateArticleDto createArticleDto)
        {
            Article article = new Article
            {
                Title = createArticleDto.Title,
                Description = createArticleDto.Description,
                Link = createArticleDto.Link
            };

            _articleRepository.CreateArticle(article);

            if(await _articleRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }
            
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError{
                    Message = "Error creating article",
                    Identifier = "CreateArticleError"
                }
            });
        }

        public async Task<Result<Empty>> DeleteArticleAsync(Guid id)
        {
            var article = await _articleRepository.GetArticleByIdAsync(id);
            if (article is null)
            {
                return Result<Empty>.NotFound();
            }

            _articleRepository.DeleteArticle(article);
            if (await _articleRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError{
                    Message = "Error deleting article",
                    Identifier = "DeleteArticleError"
                }
            });
        }

        public async Task<Result<List<ArticleDto>>> GetAllArticlesAsync()
        {
            List<Article> articles = await _articleRepository.GetAllArticlesAsync();
            List<ArticleDto> articleDtos = articles.Select(article => new ArticleDto
            {
                Id = article.Id,
                Title = article.Title,
                Description = article.Description,
                Link = article.Link
            }).ToList();

            return Result<List<ArticleDto>>.Ok(articleDtos);
        }

        public async Task<Result<ArticleDto>> GetArticleByIdAsync(Guid id)
        {
            var article = await _articleRepository.GetArticleByIdAsync(id);
            if (article is null)
            {
                return Result<ArticleDto>.NotFound();
            }

            var articleDto = new ArticleDto{
                Id = article.Id,
                Title = article.Title,
                Description = article.Description,
                Link = article.Link
            };

            return Result<ArticleDto>.Ok(articleDto);
        }

        public async Task<Result<List<ArticleDto>>> SearchArticlesAsync(string searchTerm)
        {
            List<Article> articles = await _articleRepository.SearchArticlesAsync(searchTerm);
            List<ArticleDto> articleDtos = articles.Select(article => new ArticleDto
            {
                Id = article.Id,
                Title = article.Title,
                Description = article.Description,
                Link = article.Link
            }).ToList();

            return Result<List<ArticleDto>>.Ok(articleDtos);
        }

        public async Task<Result<ArticleDto>> UpdateArticleAsync(UpdateArticleDto updateArticleDto)
        {
            var article = await _articleRepository.GetArticleByIdAsync(updateArticleDto.Id);
            if (article is null)
            {
                return Result<ArticleDto>.NotFound();
            }

            bool changeDetected = UpdatingEntitiesHelperFunction.ChangeInFieldsDetected(article, updateArticleDto); // Checking if there is a change in the fields of the note entity

            if(!changeDetected)
            {
                return Result<ArticleDto>.Ok(new ArticleDto
                {
                    Id = article.Id,
                    Title = article.Title,
                    Description = article.Description,
                    Link = article.Link,
                   
                });
            }

            article.Title = updateArticleDto.Title;
            article.Description = updateArticleDto.Description;
            article.Link = updateArticleDto.Link;

            if(await _articleRepository.Commit())
            {
                return Result<ArticleDto>.Ok(new ArticleDto
                {
                    Id = article.Id,
                    Title = article.Title,
                    Description = article.Description,
                    Link = article.Link,
                   
                });
            }
            
            return Result<ArticleDto>.BadRequest(new List<ResultError>
            {
                new ResultError{
                    Message = "Error updating article",
                    Identifier = "UpdateArticleError"
                }
            });
        }
    }
}