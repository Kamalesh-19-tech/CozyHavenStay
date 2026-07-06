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
    public class RoomService : IRoomService
    {
        private readonly AppDbContext _context;

        public RoomService(AppDbContext context)
        {
            _context = context;
        }

        // GET ALL ROOMS BY HOTEL
        public async Task<IEnumerable<Room>> GetRoomsByHotelAsync(int hotelId)
        {
            try
            {
                return await _context.Rooms
                    .Where(r => r.HotelId == hotelId)
                    .ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GET ROOM BY ID
        public async Task<Room> GetRoomByIdAsync(int id)
        {
            try
            {
                return await _context.Rooms
                    .FirstOrDefaultAsync(r => r.RoomId == id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // ADD ROOM
        public async Task<string> AddRoomAsync(CreateRoomDto roomDto)
        {
            try
            {
                // Check if the hotel actually exists
                var hotelExists = await _context.Hotels.AnyAsync(h => h.HotelId == roomDto.HotelId);
                if (!hotelExists)
                {
                    return "Hotel not found! You cannot add a room to a non-existent hotel.";
                }

                var room = new Room
                {
                    HotelId = roomDto.HotelId,
                    RoomNumber = roomDto.RoomNumber,
                    RoomSize = roomDto.RoomSize,
                    BedType = roomDto.BedType,
                    MaxOccupancy = roomDto.MaxOccupancy,
                    BaseFare = roomDto.BaseFare,
                    IsAC = roomDto.IsAC,
                    CreatedAt = DateTime.Now,
                    IsAvailable = true
                };

                _context.Rooms.Add(room);
                await _context.SaveChangesAsync();
                return "Room added successfully!";
            }
            catch (Exception)
            {
                throw;
            }
        }

        // UPDATE ROOM
        public async Task<(bool success, string message)> UpdateRoomAsync(int id, Room room)
        {
            try
            {
                var existing = await _context.Rooms
                    .FirstOrDefaultAsync(r => r.RoomId == id);
                if (existing == null)
                    return (false, "Room not found!");

                existing.RoomNumber = room.RoomNumber;
                existing.RoomSize = room.RoomSize;
                existing.BedType = room.BedType;
                existing.MaxOccupancy = room.MaxOccupancy;
                existing.BaseFare = room.BaseFare;
                existing.IsAC = room.IsAC;
                existing.IsAvailable = room.IsAvailable;

                await _context.SaveChangesAsync();
                return (true, "Room updated successfully!");
            }
            catch (Exception)
            {
                throw;
            }
        }

        // DELETE ROOM
        public async Task<(bool success, string message)> DeleteRoomAsync(int id)
        {
            try
            {
                var room = await _context.Rooms
                    .FirstOrDefaultAsync(r => r.RoomId == id);
                if (room == null)
                    return (false, "Room not found!");

                _context.Rooms.Remove(room);
                await _context.SaveChangesAsync();
                return (true, "Room deleted successfully!");
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
