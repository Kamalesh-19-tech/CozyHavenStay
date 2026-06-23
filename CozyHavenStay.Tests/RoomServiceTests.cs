using CozyHavenStay.API.Data;
using CozyHavenStay.API.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Threading.Tasks;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class RoomServiceTests
    {
        private AppDbContext _context;
        private RoomService _service;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_" + System.Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _service = new RoomService(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task GetRoomById_ReturnsNullIfNotFound()
        {
            var result = await _service.GetRoomByIdAsync(999);
            Assert.IsNull(result);
        }
    }
}
