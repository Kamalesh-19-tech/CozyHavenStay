using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Services;
using Microsoft.AspNetCore.Authorization;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET REVIEWS BY HOTEL
        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetReviewsByHotel(int hotelId)
        {
            var reviews = await _reviewService.GetReviewsByHotelAsync(hotelId);
            return Ok(reviews);
        }

        // ADD REVIEW
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
        {
            var (success, message) = await _reviewService.AddReviewAsync(dto);
            if (!success)
                return BadRequest(message);
            return Ok(message);
        }

        // DELETE REVIEW
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var (success, message) = await _reviewService.DeleteReviewAsync(id);
            if (!success)
                return NotFound(message);
            return Ok(message);
        }
    }
}
