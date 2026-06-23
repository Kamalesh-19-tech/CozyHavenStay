using CozyHavenStay.API.Controllers;
using CozyHavenStay.API.Data;
using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;
using CozyHavenStay.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class BookingControllerTests
    {
        private AppDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new AppDbContext(options);
        }

        private BookingController CreateController(AppDbContext context)
        {
            var service = new BookingService(context);
            return new BookingController(service);
        }

        private User CreateValidUser(int id, string name, string email)
        {
            return new User
            {
                UserId = id,
                FullName = name,
                Email = email,
                Password = "TestPassword123!",
                PhoneNumber = "1234567890",
                Address = "Test Address",
                Gender = "Male",
                Role = "Guest",
                IsActive = true
            };
        }

        [Test]
        public async Task GetBookingsByUser_ReturnsOkWithBookings()
        {
            var context = GetInMemoryDbContext("GetBookingsByUser");
            context.Bookings.AddRange(
                new Booking { UserId = 1, RoomId = 1, BookingStatus = "Confirmed", BookingDate = DateTime.Now },
                new Booking { UserId = 1, RoomId = 2, BookingStatus = "Pending", BookingDate = DateTime.Now },
                new Booking { UserId = 2, RoomId = 1, BookingStatus = "Confirmed", BookingDate = DateTime.Now }
            );
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetBookingsByUser(1);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var bookings = ok!.Value as IEnumerable<Booking>;
            Assert.That(bookings!.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task GetBooking_ExistingId_ReturnsOk()
        {
            var context = GetInMemoryDbContext("GetBookingSuccess");
            var booking = new Booking { UserId = 1, RoomId = 1, BookingStatus = "Confirmed", BookingDate = DateTime.Now };
            context.Bookings.Add(booking);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetBooking(booking.BookingId);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var returnedBooking = ok!.Value as Booking;
            Assert.That(returnedBooking!.BookingStatus, Is.EqualTo("Confirmed"));
        }

        [Test]
        public async Task GetBooking_NonExistingId_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("GetBookingNotFound");
            var controller = CreateController(context);

            var result = await controller.GetBooking(999);

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task CreateBooking_RoomNotFound_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("CreateBookingRoomNotFound");
            var controller = CreateController(context);

            var req = new BookingRequestDto
            {
                RoomId = 999,
                UserId = 1,
                CheckInDate = DateTime.Now.AddDays(1),
                CheckOutDate = DateTime.Now.AddDays(3),
                Guests = new List<GuestDto> { new GuestDto { GuestName = "John", Age = 30 } }
            };

            var result = await controller.CreateBooking(req);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task CreateBooking_Success_ReturnsOk()
        {
            var context = GetInMemoryDbContext("CreateBookingSuccess");
            var room = new Room { RoomId = 10, HotelId = 1, RoomNumber = "102", RoomSize = "300 sqft", BedType = "Double Bed", BaseFare = 2000, MaxOccupancy = 4, IsAvailable = true };
            context.Rooms.Add(room);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var req = new BookingRequestDto
            {
                RoomId = 10,
                UserId = 2,
                CheckInDate = DateTime.Now.AddDays(1),
                CheckOutDate = DateTime.Now.AddDays(3),
                Guests = new List<GuestDto> { new GuestDto { GuestName = "Alice", Age = 28 } }
            };

            var result = await controller.CreateBooking(req);
            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
        }

        [Test]
        public async Task UpdateBookingStatus_Existing_ReturnsOk()
        {
            var context = GetInMemoryDbContext("UpdateBookingStatusSuccess");
            var room = new Room { RoomId = 1, HotelId = 1, RoomNumber = "101", IsAvailable = true };
            context.Rooms.Add(room);
            var booking = new Booking { UserId = 1, RoomId = 1, BookingStatus = "Pending", Room = room };
            context.Bookings.Add(booking);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.UpdateBookingStatus(booking.BookingId, "Confirmed");

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
        }

        [Test]
        public async Task UpdateBookingStatus_NonExisting_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("UpdateBookingStatusNotFound");
            var controller = CreateController(context);

            var result = await controller.UpdateBookingStatus(999, "Confirmed");
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task CancelBooking_Success_ReturnsOk()
        {
            var context = GetInMemoryDbContext("CancelBookingSuccess");
            var room = new Room { RoomId = 1, HotelId = 1, RoomNumber = "101", IsAvailable = false };
            context.Rooms.Add(room);
            var booking = new Booking { UserId = 1, RoomId = 1, BookingStatus = "Confirmed", CheckInDate = DateTime.Now.AddDays(2), CheckOutDate = DateTime.Now.AddDays(5), Room = room };
            context.Bookings.Add(booking);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.CancelBooking(booking.BookingId);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
        }
    }
}
