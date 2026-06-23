using CozyHavenStay.API.Services;
using Microsoft.AspNetCore.Authorization;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // GET SYSTEM STATS
        [HttpGet("stats")]
        public async Task<IActionResult> GetSystemStats()
        {
            var stats = await _adminService.GetSystemStatsAsync();
            return Ok(stats);
        }

        // GET REVENUE REPORT
        [HttpGet("revenue-report")]
        public async Task<IActionResult> GetRevenueReport()
        {
            var report = await _adminService.GetRevenueReportAsync();
            return Ok(report);
        }

        // GET ALL USERS
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        // DELETE USER
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var (success, message) = await _adminService.DeleteUserAsync(id);
            if (!success)
            {
                if (message == "User not found!")
                    return NotFound(message);
                return BadRequest(message);
            }
            return Ok(message);
        }

        // GET ALL HOTELS
        [HttpGet("hotels")]
        public async Task<IActionResult> GetAllHotels()
        {
            var hotels = await _adminService.GetAllHotelsAsync();
            return Ok(hotels);
        }

        // GET ALL REVIEWS
        [HttpGet("reviews")]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _adminService.GetAllReviewsAsync();
            return Ok(reviews);
        }

        // DELETE REVIEW
        [HttpDelete("reviews/{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var (success, message) = await _adminService.DeleteReviewAsync(id);
            if (!success) return NotFound(message);
            return Ok(message);
        }

        // DELETE HOTEL
        [HttpDelete("hotels/{id}")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var (success, message) = await _adminService.DeleteHotelAsync(id);
            if (!success) return NotFound(message);
            return Ok(message);
        }
    }
}
