using System.Threading.Tasks;

namespace CozyHavenStay.API.Services
{
    public interface IAdminService
    {
        Task<object> GetSystemStatsAsync();
        Task<object> GetRevenueReportAsync();
        Task<object> GetAllUsersAsync();
        Task<(bool success, string message)> DeleteUserAsync(int id);
        Task<object> GetAllHotelsAsync();
        Task<object> GetAllReviewsAsync();
        Task<(bool success, string message)> DeleteReviewAsync(int id);
        Task<(bool success, string message)> DeleteHotelAsync(int id);
    }
}
