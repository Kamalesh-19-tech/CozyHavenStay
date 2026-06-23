using CozyHavenStay.API.Models;
using CozyHavenStay.API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Services
{
    public interface IHotelService
    {
        Task<IEnumerable<Hotel>> GetAllHotelsAsync();
        Task<Hotel> GetHotelByIdAsync(int id);
        Task<IEnumerable<Hotel>> SearchHotelsAsync(string location);
        Task<IEnumerable<Hotel>> GetHotelsByOwnerAsync(int ownerId);
        Task<string> AddHotelAsync(CreateHotelDto hotelDto);
        Task<(bool success, string message)> UpdateHotelAsync(int id, Hotel hotel);
        Task<(bool success, string message)> DeleteHotelAsync(int id);
    }
}
