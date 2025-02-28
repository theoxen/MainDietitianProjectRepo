using API.Common;
using API.Data;
using API.Models.Metric;
using API.Models.Metrics;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Identity;

namespace API.Services
{
    public class MetricsService : IMetricsService
    {
        private readonly UserManager<User> _userManager;
        private readonly IMetricsRepository _metricsRepository;

        public MetricsService(UserManager<User> userManager, IMetricsRepository metricsRepository)
        {
            _userManager = userManager;
            _metricsRepository = metricsRepository;

        }

        public async Task<Result<MetricsDto>> AddMetricsAsync(AddMetricsDto addMetricsDto) // the create metrics will be available once the user is found
        {
            var user = await _userManager.FindByIdAsync(addMetricsDto.UserId.ToString());
            if (user == null) // If the given userid is not found in the database
            {
                return Result<MetricsDto>.NotFound();
            }

            var metrics = new Metrics
            {
                Bodyweight = addMetricsDto.BodyWeight,
                FatMass = addMetricsDto.FatMass,
                MuscleMass = addMetricsDto.MuscleMass,
                User = user
            };

            _metricsRepository.AddMetrics(metrics);

            if (await _metricsRepository.Commit()) // Committing the changes made to the database
            {
                return Result<MetricsDto>.Ok(new MetricsDto
                {
                    Id = metrics.Id,
                    Bodyweight = metrics.Bodyweight,
                    FatMass = metrics.FatMass,
                    MuscleMass = metrics.MuscleMass,
                    DateCreated = metrics.DateCreated,
                    UserId = metrics.UserId
                });
            }

            return Result<MetricsDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToAddMetrics",
                    Message = "Failed to add metrics"
                }
            });
        }

        public async Task<Result<Empty>> DeleteMetricsAsync(Guid MetricsId)
        {
            var metrics = await _metricsRepository.GetMetricsAsync(MetricsId);
            if (metrics is null) // If the user does not have metrics in the database dont let the admin delete them.
            {
                return Result<Empty>.NotFound();
            }

            _metricsRepository.DeleteMetrics(metrics);
            if(await _metricsRepository.Commit()) // Committing the chagnes to the database
            {
                return Result<Empty>.Ok(new Empty());
            }
            
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedDeletingNote",
                    Message = "Failed to delete note"
                }
            });
        }

        public async Task<Result<MetricsDto>> EditMetricsAsync(EditMetricsDto editMetricsDto)
        {
            // Retrieve the existing metrics entry from the database using the provided metrics ID
            var existingMetrics = await _metricsRepository.GetMetricsAsync(editMetricsDto.metricsId);
            
            // Check if the existing metrics entry was found
            if (existingMetrics == null)
            {
                // If not found, return a NotFound result
                return Result<MetricsDto>.NotFound();
            }

            // Update the existing metrics entry with the new values
            existingMetrics.Bodyweight = editMetricsDto.Bodyweight;
            existingMetrics.FatMass = editMetricsDto.FatMass;
            existingMetrics.MuscleMass = editMetricsDto.MuscleMass;

            // Commit the changes to the database
            if (await _metricsRepository.Commit())
            {
                // If the commit is successful, return an Ok result with the updated metrics data
                return Result<MetricsDto>.Ok(new MetricsDto
                {
                    Id = existingMetrics.Id,
                    Bodyweight = existingMetrics.Bodyweight,
                    FatMass = existingMetrics.FatMass,
                    MuscleMass = existingMetrics.MuscleMass,
                    DateCreated = existingMetrics.DateCreated,
                    UserId = existingMetrics.UserId
                });
            }

            // If the commit fails, return a BadRequest result with an error message
            return Result<MetricsDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedUpdatingMetrics",
                    Message = "Failed to update metrics"
                }
            });
            
        }

       
        public async Task<Result<List<MetricsDto>>> SearchMetricsAsync(Guid userId, DateTime? date)
        {
            var metrics = await _metricsRepository.SearchMetricsAsync(userId, date);
            if (metrics == null || !metrics.Any())
            {
                return Result<List<MetricsDto>>.NotFound();
            }

            var metricsDtoList = metrics.Select(m => new MetricsDto
            {
                Id = m.Id,
                Bodyweight = m.Bodyweight,
                FatMass = m.FatMass,
                MuscleMass = m.MuscleMass,
                DateCreated = m.DateCreated,
                UserId = m.UserId
            }).ToList();

            return Result<List<MetricsDto>>.Ok(metricsDtoList);
        }

        public async Task<Result<MetricsDto>> ViewMetricsAsync(Guid metricsId)
        {
            // Retrieve the metrics entry from the database using the provided metrics ID
            var metrics = await _metricsRepository.GetMetricsAsync(metricsId);
            
            // Check if the metrics entry was found
            if (metrics == null)
            {
                // If not found, return a NotFound result
                return Result<MetricsDto>.NotFound();
            }

            // Return the metrics data in a MetricsDto object
            return Result<MetricsDto>.Ok(new MetricsDto
            {
                Id = metrics.Id,
                Bodyweight = metrics.Bodyweight,
                FatMass = metrics.FatMass,
                MuscleMass = metrics.MuscleMass,
                DateCreated = metrics.DateCreated,
                UserId = metrics.UserId
            });
        }
    }
}