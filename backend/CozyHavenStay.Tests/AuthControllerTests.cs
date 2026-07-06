using CozyHavenStay.API.Controllers;
using CozyHavenStay.API.Data;
using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;

using CozyHavenStay.API.Services;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class AuthControllerTests
    {
        private AppDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new AppDbContext(options);
        }

        private AuthController CreateController(AppDbContext context)
        {
            var config = new Mock<IConfiguration>();
            config.Setup(c => c["Jwt:Key"]).Returns("SuperSecretKey12345678901234567890");
            config.Setup(c => c["Jwt:Issuer"]).Returns("CozyHaven");
            config.Setup(c => c["Jwt:Audience"]).Returns("CozyHavenUsers");

            var service = new AuthService(context, config.Object);
            var logger = new Mock<ILogger<AuthController>>();
            return new AuthController(service, logger.Object);
        }

        // TEST 1: Register a new user successfully
        [Test]
        public async Task Register_NewUser_ReturnsOk()
        {
            var context = GetInMemoryDbContext("RegisterSuccess");
            var controller = CreateController(context);

            var userDto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@example.com",
                Password = "Test@123",
                Role = "Guest",
                PhoneNumber = "9876543210",
                Gender = "Male",
                Address = "123 Test Street"
            };

            var result = await controller.Register(userDto);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // TEST 2: Register with duplicate email returns BadRequest
        [Test]
        public async Task Register_DuplicateEmail_ReturnsBadRequest()
        {
            var context = GetInMemoryDbContext("RegisterDuplicate");
            context.Users.Add(new User
            {
                FullName = "Existing User",
                Email = "existing@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("pass123"),
                Role = "Guest",
                PhoneNumber = "9876543210",
                Gender = "Female",
                Address = "456 Old Street"
            });
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var userDto = new RegisterDto
            {
                FullName = "New User",
                Email = "existing@example.com",
                Password = "NewPass@123",
                Role = "Guest",
                PhoneNumber = "9111111111",
                Gender = "Male",
                Address = "789 New Street"
            };

            var result = await controller.Register(userDto);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        // TEST 3: Login with valid credentials returns token
        [Test]
        public async Task Login_ValidCredentials_ReturnsOkWithToken()
        {
            var context = GetInMemoryDbContext("LoginSuccess");
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword("Test@123");
            context.Users.Add(new User
            {
                FullName = "Login User",
                Email = "login@example.com",
                Password = hashedPassword,
                Role = "Guest",
                PhoneNumber = "9876543210",
                Gender = "Male",
                Address = "123 Login Street"
            });
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var loginDto = new LoginDto { Email = "login@example.com", Password = "Test@123" };

            var result = await controller.Login(loginDto);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // TEST 4: Login with wrong password returns Unauthorized
        [Test]
        public async Task Login_WrongPassword_ReturnsUnauthorized()
        {
            var context = GetInMemoryDbContext("LoginFail");
            context.Users.Add(new User
            {
                FullName = "User",
                Email = "user@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("CorrectPass@123"),
                Role = "Guest",
                PhoneNumber = "9999999999",
                Gender = "Female",
                Address = "321 Wrong Street"
            });
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var loginDto = new LoginDto { Email = "user@example.com", Password = "WrongPassword" };

            var result = await controller.Login(loginDto);
            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
        }

        // TEST 5: Login with non-existent email returns Unauthorized
        [Test]
        public async Task Login_NonExistentEmail_ReturnsUnauthorized()
        {
            var context = GetInMemoryDbContext("LoginNotFound");
            var controller = CreateController(context);
            var loginDto = new LoginDto { Email = "nobody@example.com", Password = "pass" };

            var result = await controller.Login(loginDto);
            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
        }
    }
}
