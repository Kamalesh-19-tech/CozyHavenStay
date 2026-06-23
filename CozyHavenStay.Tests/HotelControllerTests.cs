using CozyHavenStay.API.Controllers;
using CozyHavenStay.API.Data;
using CozyHavenStay.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

using CozyHavenStay.API.Services;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class HotelControllerTests
    {
        private AppDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new AppDbContext(options);
        }

        private HotelController CreateController(AppDbContext context)
        {
            var service = new HotelService(context);
            return new HotelController(service);
        }

        // TEST 1: Get all hotels returns Ok
        [Test]
        public async Task GetHotels_ReturnsOkWithList()
        {
            var context = GetInMemoryDbContext("GetHotels");
            context.Hotels.AddRange(
                new Hotel { HotelName = "Grand Hotel", Location = "Chennai", StarRating = 5, Description = "Luxury", IsActive = true },
                new Hotel { HotelName = "Budget Inn", Location = "Bangalore", StarRating = 3, Description = "Affordable", IsActive = true }
            );
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetAllHotels();

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var hotels = ok!.Value as IEnumerable<Hotel>;
            Assert.That(hotels!.Count(), Is.EqualTo(2));
        }

        // TEST 2: Get hotel by ID — existing hotel returns Ok
        [Test]
        public async Task GetHotel_ExistingId_ReturnsOk()
        {
            var context = GetInMemoryDbContext("GetHotelById");
            var hotel = new Hotel { HotelName = "Sea View", Location = "Goa", StarRating = 4, Description = "Beach hotel" };
            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetHotel(hotel.HotelId);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // TEST 3: Get hotel by ID — non-existing returns NotFound
        [Test]
        public async Task GetHotel_NonExistingId_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("GetHotelNotFound");
            var controller = CreateController(context);

            var result = await controller.GetHotel(999);

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        // TEST 4: Search hotels by location returns matching results
        [Test]
        public async Task SearchHotels_ValidLocation_ReturnsMatchingHotels()
        {
            var context = GetInMemoryDbContext("SearchHotels");
            context.Hotels.AddRange(
                new Hotel { HotelName = "Chennai Palace", Location = "Chennai", StarRating = 5, Description = "Luxury" },
                new Hotel { HotelName = "Mumbai Inn", Location = "Mumbai", StarRating = 3, Description = "Budget" }
            );
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.SearchHotels("Chennai");

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var hotels = ok!.Value as IEnumerable<Hotel>;
            Assert.That(hotels!.Count(), Is.EqualTo(1));
        }

        // TEST 5: Search hotels with no match returns empty list
        [Test]
        public async Task SearchHotels_NoMatch_ReturnsEmpty()
        {
            var context = GetInMemoryDbContext("SearchEmpty");
            context.Hotels.Add(new Hotel { HotelName = "City Hotel", Location = "Delhi", StarRating = 3, Description = "City center" });
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.SearchHotels("Ooty");

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var hotels = ok!.Value as IEnumerable<Hotel>;
            Assert.That(hotels, Is.Empty);
        }
    }
}
