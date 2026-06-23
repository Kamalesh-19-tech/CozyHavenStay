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
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // GET ALL BOOKINGS BY USER
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetBookingsByUser(int userId)
        {
            var bookings = await _bookingService.GetBookingsByUserAsync(userId);
            return Ok(bookings);
        }

        // GET BOOKING BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBooking(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);
            if (booking == null)
                return NotFound("Booking not found!");
            return Ok(booking);
        }

        // GET BOOKINGS BY OWNER
        [HttpGet("owner/{ownerId}")]
        [Authorize(Roles = "HotelOwner,Admin")]
        public async Task<IActionResult> GetBookingsByOwner(int ownerId)
        {
            var bookings = await _bookingService.GetBookingsByOwnerAsync(ownerId);
            return Ok(bookings);
        }

        // GET ALL BOOKINGS (ADMIN ONLY)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        // UPDATE BOOKING STATUS (Admin/Owner)
        [HttpPut("update-status/{id}")]
        [Authorize(Roles = "Admin,HotelOwner")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] string status)
        {
            var (success, message, currentStatus) = await _bookingService.UpdateBookingStatusAsync(id, status);
            if (!success) return NotFound(message);
            return Ok(new { Message = message, Status = currentStatus });
        }

        // CREATE BOOKING
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequestDto req)
        {
            var (success, message, bookingId, totalFare) = await _bookingService.CreateBookingAsync(req);
            if (!success)
            {
                if (message == "Room not found!")
                    return NotFound(message);
                return BadRequest(message);
            }
            return Ok(new { Message = message, BookingId = bookingId, TotalFare = totalFare });
        }

        // CANCEL BOOKING (User self-cancel)
        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var (success, message, refundAmount) = await _bookingService.CancelBookingAsync(id);
            if (!success)
            {
                if (message == "Booking not found!")
                    return NotFound(message);
                return BadRequest(message);
            }
            return Ok(new { Message = message, RefundAmount = refundAmount });
        }
    }
}
