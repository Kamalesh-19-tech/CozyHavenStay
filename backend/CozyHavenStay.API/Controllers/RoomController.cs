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
    public class RoomController : ControllerBase
    {
        private readonly IRoomService _roomService;

        public RoomController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        // GET ALL ROOMS BY HOTEL
        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetRoomsByHotel(int hotelId)
        {
            var rooms = await _roomService.GetRoomsByHotelAsync(hotelId);
            return Ok(rooms);
        }

        // GET ROOM BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoom(int id)
        {
            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null)
                return NotFound("Room not found!");
            return Ok(room);
        }

        // ADD ROOM
        [HttpPost]
        [Authorize(Roles = "HotelOwner,Admin")]
        public async Task<IActionResult> AddRoom([FromBody] CreateRoomDto roomDto)
        {
            var message = await _roomService.AddRoomAsync(roomDto);
            return Ok(message);
        }

        // UPDATE ROOM
        [HttpPut("{id}")]
        [Authorize(Roles = "HotelOwner,Admin")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] Room room)
        {
            var (success, message) = await _roomService.UpdateRoomAsync(id, room);
            if (!success)
                return NotFound(message);
            return Ok(message);
        }

        // DELETE ROOM
        [HttpDelete("{id}")]
        [Authorize(Roles = "HotelOwner,Admin")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var (success, message) = await _roomService.DeleteRoomAsync(id);
            if (!success)
                return NotFound(message);
            return Ok(message);
        }
    }
}
