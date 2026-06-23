using CozyHavenStay.API.Data;
using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Services
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;

        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        // GET BOOKINGS BY USER
        public async Task<IEnumerable<Booking>> GetBookingsByUserAsync(int userId)
        {
            try
            {
                return await _context.Bookings
                    .Where(b => b.UserId == userId)
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BOOKING BY ID
        public async Task<Booking> GetBookingByIdAsync(int id)
        {
            try
            {
                return await _context.Bookings
                    .FirstOrDefaultAsync(b => b.BookingId == id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET BOOKINGS BY OWNER
        public async Task<object> GetBookingsByOwnerAsync(int ownerId)
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Room)
                    .ThenInclude(r => r.Hotel)
                    .Include(b => b.User)
                    .Where(b => b.Room.Hotel.OwnerId == ownerId)
                    .OrderByDescending(b => b.BookingDate)
                    .Select(b => new
                    {
                        b.BookingId,
                        b.CheckInDate,
                        b.CheckOutDate,
                        b.TotalFare,
                        b.BookingStatus,
                        GuestName = b.User.FullName,
                        HotelName = b.Room.Hotel.HotelName,
                        RoomNumber = b.Room.RoomNumber
                    })
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET ALL BOOKINGS
        public async Task<object> GetAllBookingsAsync()
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Room)
                    .ThenInclude(r => r.Hotel)
                    .Include(b => b.User)
                    .OrderByDescending(b => b.BookingDate)
                    .Select(b => new
                    {
                        b.BookingId,
                        b.CheckInDate,
                        b.CheckOutDate,
                        b.TotalFare,
                        b.BookingStatus,
                        GuestName = b.User.FullName,
                        HotelName = b.Room.Hotel.HotelName,
                        RoomNumber = b.Room.RoomNumber
                    })
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE BOOKING STATUS
        public async Task<(bool success, string message, string status)> UpdateBookingStatusAsync(int id, string status)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Room)
                    .FirstOrDefaultAsync(b => b.BookingId == id);
                if (booking == null) return (false, "Booking not found!", null);

                var previousStatus = booking.BookingStatus;
                booking.BookingStatus = status;

                if (status == "Cancelled" && previousStatus != "Cancelled")
                {
                    if (booking.Room != null)
                        booking.Room.IsAvailable = true;

                    var payment = await _context.Payments
                        .FirstOrDefaultAsync(p => p.BookingId == id && p.PaymentStatus == "Success");

                    if (payment != null)
                    {
                        var refund = new Refund
                        {
                            BookingId = booking.BookingId,
                            UserId = booking.UserId,
                            RefundAmount = payment.Amount,
                            RefundDate = DateTime.Now,
                            RefundStatus = "Processed",
                            Reason = "Cancelled by Admin - Full refund issued"
                        };
                        _context.Refunds.Add(refund);

                        payment.PaymentStatus = "Refunded";
                    }
                }

                await _context.SaveChangesAsync();
                return (true, "Booking status updated!", status);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CREATE BOOKING
        public async Task<(bool success, string message, int bookingId, decimal totalFare)> CreateBookingAsync(BookingRequestDto req)
        {
            try
            {
                var room = await _context.Rooms
                    .FirstOrDefaultAsync(r => r.RoomId == req.RoomId);
                if (room == null)
                    return (false, "Room not found!", 0, 0);
                if (!room.IsAvailable)
                    return (false, "Room is not available on these dates!", 0, 0);

                if (req.Guests == null || req.Guests.Count == 0)
                    return (false, "Must have at least one guest!", 0, 0);

                int baseCapacity = 1;
                int maxCapacity = 2;
                string bedType = (room.BedType ?? "").ToLower();

                if (bedType.Contains("double"))
                {
                    baseCapacity = 2;
                    maxCapacity = 4;
                }
                else if (bedType.Contains("king"))
                {
                    baseCapacity = 4;
                    maxCapacity = 6;
                }

                if (req.Guests.Count > maxCapacity)
                {
                    return (false, $"Maximum {maxCapacity} guests allowed for a {room.BedType} room.", 0, 0);
                }

                decimal totalExtraCharges = 0;
                var bookingGuests = new List<BookingGuest>();

                for (int i = 0; i < req.Guests.Count; i++)
                {
                    var guestInfo = req.Guests[i];
                    decimal extraCharge = 0;

                    if (i >= baseCapacity)
                    {
                        if (guestInfo.Age > 14)
                        {
                            extraCharge = room.BaseFare * 0.40m; // 40%
                        }
                        else
                        {
                            extraCharge = room.BaseFare * 0.20m; // 20%
                        }
                    }

                    totalExtraCharges += extraCharge;

                    bookingGuests.Add(new BookingGuest
                    {
                        GuestName = guestInfo.GuestName,
                        Age = guestInfo.Age,
                        IsAdult = guestInfo.Age > 14,
                        ExtraCharge = extraCharge
                    });
                }

                var nights = (req.CheckOutDate.Date - req.CheckInDate.Date).Days;
                if (nights <= 0) nights = 1;

                decimal subTotal = (room.BaseFare + totalExtraCharges) * nights;
                decimal tax = subTotal * 0.10m; // 10% tax
                decimal totalFare = subTotal + tax;

                var booking = new Booking
                {
                    UserId = req.UserId,
                    RoomId = req.RoomId,
                    CheckInDate = req.CheckInDate,
                    CheckOutDate = req.CheckOutDate,
                    NoOfRooms = req.NoOfRooms,
                    NoOfAdults = bookingGuests.Count(g => g.IsAdult),
                    NoOfChildren = bookingGuests.Count(g => !g.IsAdult),
                    TotalFare = totalFare,
                    BookingStatus = "Pending",
                    BookingDate = DateTime.Now
                };

                room.IsAvailable = false;

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync(); // Get the BookingId

                foreach (var bg in bookingGuests)
                {
                    bg.BookingId = booking.BookingId;
                    _context.BookingGuests.Add(bg);
                }

                await _context.SaveChangesAsync();

                return (true, "Booking request created successfully! Please proceed to payment.", booking.BookingId, totalFare);


            }
            catch (Exception)
            {
                throw;
            }
        }

        // CANCEL BOOKING
        public async Task<(bool success, string message, decimal refundAmount)> CancelBookingAsync(int id)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Room)
                    .FirstOrDefaultAsync(b => b.BookingId == id);
                if (booking == null) return (false, "Booking not found!", 0);
                if (booking.BookingStatus == "Cancelled") return (false, "Booking is already cancelled!", 0);

                booking.BookingStatus = "Cancelled";

                if (booking.Room != null)
                    booking.Room.IsAvailable = true;

                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.BookingId == id && p.PaymentStatus == "Success");

                decimal refundAmount = 0;
                if (payment != null)
                {
                    var refund = new Refund
                    {
                        BookingId = booking.BookingId,
                        UserId = booking.UserId,
                        RefundAmount = payment.Amount,
                        RefundDate = DateTime.Now,
                        RefundStatus = "Processed",
                        Reason = "Booking cancelled - Full refund issued"
                    };
                    _context.Refunds.Add(refund);
                    payment.PaymentStatus = "Refunded";
                    refundAmount = payment.Amount;
                }

                await _context.SaveChangesAsync();
                return (true, "Booking cancelled and refund processed!", refundAmount);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
