using CozyHavenStay.API.Controllers;
using CozyHavenStay.API.Data;
using CozyHavenStay.API.Models;
using CozyHavenStay.API.Services;
using CozyHavenStay.API.DTOs;
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
    public class ReviewControllerTests
    {
        private AppDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new AppDbContext(options);
        }

        private ReviewController CreateController(AppDbContext context)
        {
            var service = new ReviewService(context);
            return new ReviewController(service);
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
        public async Task GetReviewsByHotel_ReturnsOkWithReviews()
        {
            var context = GetInMemoryDbContext("GetReviewsByHotel");
            var user = CreateValidUser(1, "Reviewer One", "r1@example.com");
            context.Users.Add(user);
            context.Reviews.AddRange(
                new Review { ReviewId = 1, HotelId = 1, UserId = 1, Rating = 5, Comment = "Excellent", ReviewDate = DateTime.Now },
                new Review { ReviewId = 2, HotelId = 1, UserId = 1, Rating = 4, Comment = "Good stay", ReviewDate = DateTime.Now }
            );
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetReviewsByHotel(1);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var reviews = ok!.Value as IEnumerable<object>;
            Assert.That(reviews!.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task AddReview_Success_ReturnsOk()
        {
            var context = GetInMemoryDbContext("AddReviewSuccess");
            var controller = CreateController(context);
            var review = new CreateReviewDto { HotelId = 1, UserId = 10, Rating = 5, Comment = "Great!" };

            var result = await controller.AddReview(review);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            Assert.That(ok!.Value, Is.EqualTo("Review added successfully!"));
        }

        [Test]
        public async Task AddReview_Duplicate_ReturnsBadRequest()
        {
            var context = GetInMemoryDbContext("AddReviewDuplicate");
            context.Reviews.Add(new Review { ReviewId = 1, HotelId = 1, UserId = 5, Rating = 4, Comment = "First review" });
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var duplicateReview = new CreateReviewDto { HotelId = 1, UserId = 5, Rating = 5, Comment = "Duplicate review" };

            var result = await controller.AddReview(duplicateReview);

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task DeleteReview_Success_ReturnsOk()
        {
            var context = GetInMemoryDbContext("DeleteReviewSuccess");
            var review = new Review { ReviewId = 20, HotelId = 1, UserId = 1, Rating = 5, Comment = "ToDelete" };
            context.Reviews.Add(review);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.DeleteReview(20);

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
    }
}
