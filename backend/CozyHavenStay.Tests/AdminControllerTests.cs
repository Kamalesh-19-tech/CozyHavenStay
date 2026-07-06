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
    public class AdminControllerTests
    {
        private AppDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new AppDbContext(options);
        }

        private AdminController CreateController(AppDbContext context)
        {
            var service = new AdminService(context);
            return new AdminController(service);
        }

        private User CreateValidUser(int id, string name, string email, string role = "Guest")
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
                Role = role,
                IsActive = true
            };
        }

        private Hotel CreateValidHotel(int id, string name, string location, int ownerId)
        {
            return new Hotel
            {
                HotelId = id,
                HotelName = name,
                Location = location,
                Description = "A nice test hotel",
                StarRating = 5,
                OwnerId = ownerId,
                IsActive = true
            };
        }

        [Test]
        public async Task GetSystemStats_ReturnsOk()
        {
            var context = GetInMemoryDbContext("GetSystemStats");
            var user = CreateValidUser(1, "User 1", "u1@cozy.com");
            context.Users.Add(user);
            var hotel = CreateValidHotel(1, "Hotel 1", "Chennai", 1);
            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetSystemStats();

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
        }

        [Test]
        public async Task GetRevenueReport_ReturnsOk()
        {
            var context = GetInMemoryDbContext("GetRevenueReport");
            var hotel = CreateValidHotel(1, "Hotel 1", "Goa", 1);
            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetRevenueReport();

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
        }

        [Test]
        public async Task GetAllUsers_ReturnsOk()
        {
            var context = GetInMemoryDbContext("GetAllUsers");
            context.Users.AddRange(
                CreateValidUser(1, "Alice", "alice@example.com"),
                CreateValidUser(2, "Bob", "bob@example.com")
            );
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetAllUsers();

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var users = ok!.Value as IEnumerable<object>;
            Assert.That(users!.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task DeleteUser_Success_ReturnsOk()
        {
            var context = GetInMemoryDbContext("DeleteUserSuccess");
            context.Users.Add(CreateValidUser(10, "Guest", "g@example.com", "Guest"));
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.DeleteUser(10);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            Assert.That(ok!.Value, Is.EqualTo("User deleted successfully!"));
        }

        [Test]
        public async Task DeleteUser_AdminAccount_ReturnsBadRequest()
        {
            var context = GetInMemoryDbContext("DeleteUserAdmin");
            context.Users.Add(CreateValidUser(1, "Admin", "admin@example.com", "Admin"));
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.DeleteUser(1);

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task DeleteUser_NonExisting_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("DeleteUserNotFound");
            var controller = CreateController(context);

            var result = await controller.DeleteUser(999);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task GetAllHotels_ReturnsOk()
        {
            var context = GetInMemoryDbContext("GetAllHotels");
            var owner = CreateValidUser(5, "Owner", "owner@example.com", "HotelOwner");
            context.Users.Add(owner);
            context.Hotels.Add(CreateValidHotel(1, "Hotel One", "Goa", 5));
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetAllHotels();

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
        }

        [Test]
        public async Task GetAllReviews_ReturnsOk()
        {
            var context = GetInMemoryDbContext("GetAllReviews");
            var user = CreateValidUser(1, "Reviewer", "r@example.com");
            var hotel = CreateValidHotel(1, "Hotel", "Goa", 1);
            context.Users.Add(user);
            context.Hotels.Add(hotel);
            context.Reviews.Add(new Review { ReviewId = 1, UserId = 1, HotelId = 1, Rating = 5, Comment = "Excellent" });
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetAllReviews();

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
        }

        [Test]
        public async Task DeleteReview_Success_ReturnsOk()
        {
            var context = GetInMemoryDbContext("DeleteReviewSuccess");
            context.Reviews.Add(new Review { ReviewId = 5, Rating = 4, Comment = "Nice" });
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.DeleteReview(5);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            Assert.That(ok!.Value, Is.EqualTo("Review deleted!"));
        }

        [Test]
        public async Task DeleteReview_NonExisting_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("DeleteReviewNotFound");
            var controller = CreateController(context);

            var result = await controller.DeleteReview(999);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task DeleteHotel_Success_ReturnsOk()
        {
            var context = GetInMemoryDbContext("DeleteHotelSuccess");
            context.Hotels.Add(CreateValidHotel(10, "Hotel to Delete", "Ooty", 1));
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.DeleteHotel(10);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            Assert.That(ok!.Value, Is.EqualTo("Hotel 'Hotel to Delete' and all related data deleted successfully!"));
        }

        [Test]
        public async Task DeleteHotel_NonExisting_ReturnsNotFound()
        {
            var context = GetInMemoryDbContext("DeleteHotelNotFound");
            var controller = CreateController(context);

            var result = await controller.DeleteHotel(999);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }
    }
}
