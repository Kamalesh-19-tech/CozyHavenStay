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
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;

        public PaymentService(AppDbContext context)
        {
            _context = context;
        }

        // GET PAYMENTS BY USER
        public async Task<IEnumerable<Payment>> GetPaymentsByUserAsync(int userId)
        {
            try
            {
                return await _context.Payments
                    .Where(p => p.UserId == userId)
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // MAKE PAYMENT
        public async Task<string> MakePaymentAsync(CreatePaymentDto dto)
        {
            try
            {
                // Check if the booking actually exists
                var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BookingId == dto.BookingId);
                if (booking == null)
                {
                    return "Booking not found! You cannot pay for a non-existent booking.";
                }

                // Check if user matches the booking
                if (booking.UserId != dto.UserId)
                {
                    return "Invalid UserId! This booking does not belong to the specified user.";
                }

                var payment = new Payment
                {
                    BookingId = dto.BookingId,
                    UserId = dto.UserId,
                    Amount = dto.Amount,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentDate = DateTime.Now,
                    PaymentStatus = "Success"
                };
                _context.Payments.Add(payment);

                // Update booking status to Confirmed
                booking.BookingStatus = "Confirmed";

                await _context.SaveChangesAsync();
                return "Payment successful!";
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
