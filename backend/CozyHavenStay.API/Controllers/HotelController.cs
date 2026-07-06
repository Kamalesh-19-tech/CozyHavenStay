using CozyHavenStay.API.Models;
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
    public class HotelController : ControllerBase
    {
        private readonly IHotelService _hotelService;

        public HotelController(IHotelService hotelService)
        {
            _hotelService = hotelService;
        }

        // GET ALL HOTELS
        [HttpGet]
        public async Task<IActionResult> GetAllHotels()
        {
            var hotels = await _hotelService.GetAllHotelsAsync();
            return Ok(hotels);
        }

        // GET HOTEL BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetHotel(int id)
        {
            var hotel = await _hotelService.GetHotelByIdAsync(id);
            if (hotel == null)
                return NotFound("Hotel not found!");
            return Ok(hotel);
        }

        // SEARCH HOTELS BY LOCATION
        [HttpGet("search/{location}")]
        public async Task<IActionResult> SearchHotels(string location)
        {
            var hotels = await _hotelService.SearchHotelsAsync(location);
            return Ok(hotels);
        }

        // GET HOTELS BY OWNER
        [HttpGet("owner/{ownerId}")]
        [Authorize(Roles = "HotelOwner,Admin")]
        public async Task<IActionResult> GetHotelsByOwner(int ownerId)
        {
            var hotels = await _hotelService.GetHotelsByOwnerAsync(ownerId);
            return Ok(hotels);
        }

        // ADD HOTEL
        [HttpPost]
        [Authorize(Roles = "HotelOwner,Admin")]
        public async Task<IActionResult> AddHotel([FromBody] CreateHotelDto hotelDto)
        {
            var message = await _hotelService.AddHotelAsync(hotelDto);
            return Ok(message);
        }

        // UPDATE HOTEL
        [HttpPut("{id}")]
        [Authorize(Roles = "HotelOwner,Admin")]
        public async Task<IActionResult> UpdateHotel(int id, [FromBody] Hotel hotel)
        {
            var (success, message) = await _hotelService.UpdateHotelAsync(id, hotel);
            if (!success)
                return NotFound(message);
            return Ok(message);
        }

        // DELETE HOTEL
        [HttpDelete("{id}")]
        [Authorize(Roles = "HotelOwner,Admin")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var (success, message) = await _hotelService.DeleteHotelAsync(id);
            if (!success)
                return NotFound(message);
            return Ok(message);
        }
    }
}
