using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Services
{
    public interface IReviewService
    {
        Task<object> GetReviewsByHotelAsync(int hotelId);
        Task<(bool success, string message)> AddReviewAsync(CreateReviewDto dto);
        Task<(bool success, string message)> DeleteReviewAsync(int id);
    }
}
