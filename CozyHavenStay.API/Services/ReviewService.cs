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
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        // GET REVIEWS BY HOTEL
        public async Task<object> GetReviewsByHotelAsync(int hotelId)
        {
            try
            {
                return await _context.Reviews
                    .Include(r => r.User)
                    .Where(r => r.HotelId == hotelId)
                    .OrderByDescending(r => r.ReviewDate)
                    .Select(r => new
                    {
                        r.ReviewId,
                        r.Rating,
                        r.Comment,
                        r.ReviewDate,
                        GuestName = r.User.FullName,
                        r.UserId
                    })
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // ADD REVIEW
        public async Task<(bool success, string message)> AddReviewAsync(CreateReviewDto dto)
        {
            try
            {
                var existing = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.UserId == dto.UserId && r.HotelId == dto.HotelId);
                if (existing != null)
                    return (false, "You have already reviewed this hotel!");

                var review = new Review
                {
                    UserId = dto.UserId,
                    HotelId = dto.HotelId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    ReviewDate = DateTime.Now
                };
                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();
                return (true, "Review added successfully!");
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE REVIEW
        public async Task<(bool success, string message)> DeleteReviewAsync(int id)
        {
            try
            {
                var review = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.ReviewId == id);
                if (review == null)
                    return (false, "Review not found!");

                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();
                return (true, "Review deleted!");
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
