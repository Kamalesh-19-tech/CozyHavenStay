using CozyHavenStay.API.Data;
using CozyHavenStay.API.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Threading.Tasks;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class PaymentServiceTests
    {
        private AppDbContext _context;
        private PaymentService _service;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_" + System.Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _service = new PaymentService(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task GetPaymentsByUser_ReturnsEmptyList()
        {
            var result = await _service.GetPaymentsByUserAsync(999);
            Assert.IsEmpty(result);
        }
    }
}
