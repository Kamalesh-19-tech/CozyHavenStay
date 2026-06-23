using CozyHavenStay.API.Data;
using CozyHavenStay.API.Models;
using CozyHavenStay.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using System.Threading.Tasks;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class AuthServiceTests
    {
        private AppDbContext _context;
        private Mock<IConfiguration> _mockConfig;
        private AuthService _authService;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_" + System.Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _mockConfig = new Mock<IConfiguration>();
            _authService = new AuthService(_context, _mockConfig.Object);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task CheckEmailAsync_ReturnsFalseIfNotFound()
        {
            var result = await _authService.CheckEmailAsync("nonexistent@test.com");
            Assert.IsFalse(result);
        }
    }
}
