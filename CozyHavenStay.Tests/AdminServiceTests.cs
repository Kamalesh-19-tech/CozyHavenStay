using CozyHavenStay.API.Data;
using CozyHavenStay.API.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Threading.Tasks;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class AdminServiceTests
    {
        private AppDbContext _context;
        private AdminService _adminService;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_" + System.Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _adminService = new AdminService(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task GetSystemStatsAsync_ReturnsStats()
        {
            var stats = await _adminService.GetSystemStatsAsync();
            Assert.IsNotNull(stats);
        }
    }
}
