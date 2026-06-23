using CozyHavenStay.API.Data;
using CozyHavenStay.API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        // GET SYSTEM STATS
        public async Task<object> GetSystemStatsAsync()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                var hotelCount = await _context.Hotels.CountAsync();
                var roomCount = await _context.Rooms.CountAsync();
                var bookingCount = await _context.Bookings.CountAsync();
                var totalRevenue = await _context.Payments
                    .Where(p => p.PaymentStatus == "Success")
                    .SumAsync(p => p.Amount);

                return new
                {
                    TotalUsers = userCount,
                    TotalHotels = hotelCount,
                    TotalRooms = roomCount,
                    TotalBookings = bookingCount,
                    TotalRevenue = totalRevenue
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET REVENUE REPORT
        public async Task<object> GetRevenueReportAsync()
        {
            try
            {
                var hotels = await _context.Hotels.ToListAsync();
                var rooms = await _context.Rooms.ToListAsync();
                var bookings = await _context.Bookings
                    .Include(b => b.User)
                    .Where(b => b.BookingStatus != "Cancelled")
                    .ToListAsync();

                return hotels.Select(h => {
                    var roomIds = rooms.Where(r => r.HotelId == h.HotelId).Select(r => r.RoomId).ToList();
                    var hotelBookings = bookings.Where(b => roomIds.Contains(b.RoomId)).ToList();
                    
                    return new
                    {
                        HotelId = h.HotelId,
                        HotelName = h.HotelName,
                        TotalBookings = hotelBookings.Count,
                        TotalRevenue = hotelBookings.Sum(b => b.TotalFare),
                        Bookings = hotelBookings.OrderByDescending(b => b.BookingDate).Select(b => new
                        {
                            b.BookingId,
                            GuestName = b.User?.FullName ?? "Unknown",
                            b.CheckInDate,
                            b.CheckOutDate,
                            b.TotalFare,
                            b.BookingStatus
                        }).ToList()
                    };
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ThenBy(x => x.HotelName)
                .ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET ALL USERS
        public async Task<object> GetAllUsersAsync()
        {
            try
            {
                return await _context.Users
                    .OrderBy(u => u.UserId)
                    .Select(u => new
                    {
                        u.UserId,
                        u.FullName,
                        u.Email,
                        u.PhoneNumber,
                        u.Role,
                        u.Gender,
                        u.IsActive
                    })
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE USER
        public async Task<(bool success, string message)> DeleteUserAsync(int id)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null) return (false, "User not found!");
                if (user.Role == "Admin") return (false, "Cannot delete an Admin account!");

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return (true, "User deleted successfully!");
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET ALL HOTELS
        public async Task<object> GetAllHotelsAsync()
        {
            try
            {
                return await _context.Hotels
                    .Include(h => h.Owner)
                    .OrderBy(h => h.HotelId)
                    .Select(h => new
                    {
                        h.HotelId,
                        h.HotelName,
                        h.Location,
                        h.StarRating,
                        h.IsActive,
                        OwnerName = h.Owner.FullName,
                        OwnerEmail = h.Owner.Email,
                        RoomCount = _context.Rooms.Count(r => r.HotelId == h.HotelId)
                    })
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET ALL REVIEWS
        public async Task<object> GetAllReviewsAsync()
        {
            try
            {
                return await _context.Reviews
                    .Include(r => r.User)
                    .Include(r => r.Hotel)
                    .OrderByDescending(r => r.ReviewDate)
                    .Select(r => new
                    {
                        r.ReviewId,
                        r.Rating,
                        r.Comment,
                        r.ReviewDate,
                        GuestName = r.User.FullName,
                        GuestEmail = r.User.Email,
                        HotelName = r.Hotel.HotelName,
                        r.HotelId,
                        r.UserId
                    })
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // This is used by the Admin to delete fake or inappropriate reviews
        public async Task<(bool success, string message)> DeleteReviewAsync(int id)
        {
            try
            {
                var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == id);
                if (review == null) return (false, "Review not found!");

                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();
                return (true, "Review deleted!");
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE HOTEL
        public async Task<(bool success, string message)> DeleteHotelAsync(int id)
        {
            try
            {
                var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.HotelId == id);
                if (hotel == null) return (false, "Hotel not found!");

                var rooms = await _context.Rooms.Where(r => r.HotelId == id).ToListAsync();
                var roomIds = rooms.Select(r => r.RoomId).ToList();

                if (roomIds.Any())
                {
                    var bookings = await _context.Bookings
                        .Where(b => roomIds.Contains(b.RoomId)).ToListAsync();
                    var bookingIds = bookings.Select(b => b.BookingId).ToList();

                    if (bookingIds.Any())
                    {
                        var guests = await _context.BookingGuests
                            .Where(g => bookingIds.Contains(g.BookingId)).ToListAsync();
                        _context.BookingGuests.RemoveRange(guests);

                        var payments = await _context.Payments
                            .Where(p => bookingIds.Contains(p.BookingId)).ToListAsync();
                        _context.Payments.RemoveRange(payments);

                        var refunds = await _context.Refunds
                            .Where(r => bookingIds.Contains(r.BookingId)).ToListAsync();
                        _context.Refunds.RemoveRange(refunds);

                        _context.Bookings.RemoveRange(bookings);
                    }

                    var reviews = await _context.Reviews.Where(r => r.HotelId == id).ToListAsync();
                    _context.Reviews.RemoveRange(reviews);

                    _context.Rooms.RemoveRange(rooms);
                }

                _context.Hotels.Remove(hotel);
                await _context.SaveChangesAsync();

                return (true, $"Hotel '{hotel.HotelName}' and all related data deleted successfully!");
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
