using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Services
{
    public interface IBookingService
    {
        Task<IEnumerable<Booking>> GetBookingsByUserAsync(int userId);
        Task<Booking> GetBookingByIdAsync(int id);
        Task<object> GetBookingsByOwnerAsync(int ownerId);
        Task<object> GetAllBookingsAsync();
        Task<(bool success, string message, string status)> UpdateBookingStatusAsync(int id, string status);
        Task<(bool success, string message, int bookingId, decimal totalFare)> CreateBookingAsync(BookingRequestDto req);
        Task<(bool success, string message, decimal refundAmount)> CancelBookingAsync(int id);
    }
}
