using CozyHavenStay.API.Models;
using CozyHavenStay.API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Services
{
    public interface IRoomService
    {
        Task<IEnumerable<Room>> GetRoomsByHotelAsync(int hotelId);
        Task<Room> GetRoomByIdAsync(int id);
        Task<string> AddRoomAsync(CreateRoomDto roomDto);
        Task<(bool success, string message)> UpdateRoomAsync(int id, Room room);
        Task<(bool success, string message)> DeleteRoomAsync(int id);
    }
}
