using CozyHavenStay.API.Controllers;
using CozyHavenStay.API.Data;
using CozyHavenStay.API.Models;
using CozyHavenStay.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class RoomControllerTests
    {
        private AppDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new AppDbContext(options);
        }

        private RoomController CreateController(AppDbContext context)
        {
            var service = new RoomService(context);
            return new RoomController(service);
        }

        [Test]
        public async Task GetRoomsByHotel_ReturnsOkWithRooms()
        {
            var context = GetInMemoryDbContext("GetRoomsByHotel");
            context.Rooms.AddRange(
                new Room { RoomId = 1, HotelId = 1, RoomNumber = "101", RoomSize = "200 sqft", BedType = "Single", BaseFare = 1500, MaxOccupancy = 2 },
                new Room { RoomId = 2, HotelId = 1, RoomNumber = "102", RoomSize = "300 sqft", BedType = "Double Bed", BaseFare = 3000, MaxOccupancy = 4 },
                new Room { RoomId = 3, HotelId = 2, RoomNumber = "201", RoomSize = "150 sqft", BedType = "Single", BaseFare = 800, MaxOccupancy = 2 }
            );
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetRoomsByHotel(1);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var rooms = ok!.Value as IEnumerable<Room>;
            Assert.That(rooms!.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task GetRoom_ExistingId_ReturnsOk()
        {
            var context = GetInMemoryDbContext("GetRoomSuccess");
            var room = new Room { RoomId = 10, HotelId = 1, RoomNumber = "105", RoomSize = "200 sqft", BedType = "Single", BaseFare = 1000, MaxOccupancy = 2 };
            context.Rooms.Add(room);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetRoom(10);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var returnedRoom = ok!.Value as Room;
            Assert.That(returnedRoom!.RoomNumber, Is.EqualTo("105"));
        }

        [Test]
        public async Task GetRoom_NonExistingId_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("GetRoomNotFound");
            var controller = CreateController(context);

            var result = await controller.GetRoom(999);

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task AddRoom_ReturnsOkWithMessage()
        {
            var context = GetInMemoryDbContext("AddRoomSuccess");
            context.Hotels.Add(new Hotel { HotelId = 1, HotelName = "Test Hotel", Location = "Kerala", Description = "Nice Hotel", StarRating = 5 });
            await context.SaveChangesAsync();
            
            var controller = CreateController(context);
            var roomDto = new CozyHavenStay.API.DTOs.CreateRoomDto { HotelId = 1, RoomNumber = "301", RoomSize = "500 sqft", BedType = "King", BaseFare = 5000, MaxOccupancy = 6, IsAC = true };

            var result = await controller.AddRoom(roomDto);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            Assert.That(ok!.Value, Is.EqualTo("Room added successfully!"));
        }

        [Test]
        public async Task UpdateRoom_ExistingRoom_ReturnsOk()
        {
            var context = GetInMemoryDbContext("UpdateRoomSuccess");
            var room = new Room { RoomId = 20, HotelId = 1, RoomNumber = "110", RoomSize = "200 sqft", BedType = "Single", BaseFare = 1000, MaxOccupancy = 2 };
            context.Rooms.Add(room);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var updatedRoom = new Room { RoomNumber = "110-B", RoomSize = "220 sqft", BedType = "Single", BaseFare = 1200, MaxOccupancy = 2 };
            var result = await controller.UpdateRoom(20, updatedRoom);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            Assert.That(ok!.Value, Is.EqualTo("Room updated successfully!"));
        }

        [Test]
        public async Task UpdateRoom_NonExistingRoom_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("UpdateRoomNotFound");
            var controller = CreateController(context);
            var updatedRoom = new Room { RoomNumber = "305", RoomSize = "500 sqft", BedType = "King", BaseFare = 5000, MaxOccupancy = 6 };

            var result = await controller.UpdateRoom(999, updatedRoom);

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task DeleteRoom_ExistingRoom_ReturnsOk()
        {
            var context = GetInMemoryDbContext("DeleteRoomSuccess");
            var room = new Room { RoomId = 30, HotelId = 1, RoomNumber = "115", RoomSize = "200 sqft", BedType = "Single", BaseFare = 1500, MaxOccupancy = 2 };
            context.Rooms.Add(room);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.DeleteRoom(30);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            Assert.That(ok!.Value, Is.EqualTo("Room deleted successfully!"));
        }

        [Test]
        public async Task DeleteRoom_NonExistingRoom_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("DeleteRoomNotFound");
            var controller = CreateController(context);

            var result = await controller.DeleteRoom(999);

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }
    }
}
