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
    public class HotelService : IHotelService
    {
        private readonly AppDbContext _context;

        public HotelService(AppDbContext context)
        {
            _context = context;
        }

        // GET ALL HOTELS
        public async Task<IEnumerable<Hotel>> GetAllHotelsAsync()
        {
            try
            {
                return await _context.Hotels
                    .Where(h => h.IsActive)
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET HOTEL BY ID
        public async Task<Hotel> GetHotelByIdAsync(int id)
        {
            try
            {
                return await _context.Hotels
                    .FirstOrDefaultAsync(h => h.HotelId == id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // SEARCH HOTELS
        public async Task<IEnumerable<Hotel>> SearchHotelsAsync(string location)
        {
            try
            {
                return await _context.Hotels
                    .Where(h => h.Location.Contains(location) && h.IsActive)
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET HOTELS BY OWNER
        public async Task<IEnumerable<Hotel>> GetHotelsByOwnerAsync(int ownerId)
        {
            try
            {
                return await _context.Hotels
                    .Where(h => h.OwnerId == ownerId && h.IsActive)
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // ADD HOTEL
        public async Task<string> AddHotelAsync(CreateHotelDto hotelDto)
        {
            try
            {
                var hotel = new Hotel
                {
                    OwnerId = hotelDto.OwnerId,
                    HotelName = hotelDto.HotelName,
                    Location = hotelDto.Location,
                    Description = hotelDto.Description,
                    StarRating = hotelDto.StarRating,
                    HasDining = hotelDto.HasDining,
                    HasParking = hotelDto.HasParking,
                    HasWifi = hotelDto.HasWifi,
                    HasPool = hotelDto.HasPool,
                    HasGym = hotelDto.HasGym,
                    HasRoomService = hotelDto.HasRoomService,
                    ImageUrl = hotelDto.ImageUrl,
                    CreatedAt = DateTime.Now,
                    IsActive = true
                };
                
                _context.Hotels.Add(hotel);
                await _context.SaveChangesAsync();
                return "Hotel added successfully!";
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE HOTEL
        public async Task<(bool success, string message)> UpdateHotelAsync(int id, Hotel hotel)
        {
            try
            {
                var existing = await _context.Hotels
                    .FirstOrDefaultAsync(h => h.HotelId == id);
                if (existing == null)
                    return (false, "Hotel not found!");

                existing.HotelName = hotel.HotelName;
                existing.Location = hotel.Location;
                existing.Description = hotel.Description;
                existing.StarRating = hotel.StarRating;
                existing.HasDining = hotel.HasDining;
                existing.HasParking = hotel.HasParking;
                existing.HasWifi = hotel.HasWifi;
                existing.HasPool = hotel.HasPool;
                existing.HasGym = hotel.HasGym;
                existing.HasRoomService = hotel.HasRoomService;

                await _context.SaveChangesAsync();
                return (true, "Hotel updated successfully!");
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE HOTEL
        public async Task<(bool success, string message)> DeleteHotelAsync(int id)
        {
            try
            {
                var hotel = await _context.Hotels
                    .FirstOrDefaultAsync(h => h.HotelId == id);
                if (hotel == null)
                    return (false, "Hotel not found!");

                hotel.IsActive = false;
                await _context.SaveChangesAsync();
                return (true, "Hotel deleted successfully!");
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
