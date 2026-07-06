using CozyHavenStay.API.Controllers;
using CozyHavenStay.API.Data;
using CozyHavenStay.API.Models;
using CozyHavenStay.API.Services;
using CozyHavenStay.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CozyHavenStay.Tests
{
    [TestFixture]
    public class PaymentControllerTests
    {
        private AppDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new AppDbContext(options);
        }

        private PaymentController CreateController(AppDbContext context)
        {
            var service = new PaymentService(context);
            return new PaymentController(service);
        }

        [Test]
        public async Task GetPaymentsByUser_ReturnsOkWithPayments()
        {
            var context = GetInMemoryDbContext("GetPaymentsByUser");
            context.Payments.AddRange(
                new Payment { PaymentId = 1, UserId = 1, BookingId = 1, Amount = 1500, PaymentMethod = "Card", PaymentStatus = "Success" },
                new Payment { PaymentId = 2, UserId = 1, BookingId = 2, Amount = 3000, PaymentMethod = "UPI", PaymentStatus = "Success" },
                new Payment { PaymentId = 3, UserId = 2, BookingId = 3, Amount = 1000, PaymentMethod = "Card", PaymentStatus = "Success" }
            );
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var result = await controller.GetPaymentsByUser(1);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            var payments = ok!.Value as IEnumerable<Payment>;
            Assert.That(payments!.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task MakePayment_ReturnsOkWithMessage()
        {
            var context = GetInMemoryDbContext("MakePaymentSuccess");
            context.Bookings.Add(new Booking { BookingId = 1, UserId = 1, RoomId = 1, BookingStatus = "Pending", TotalFare = 2000 });
            await context.SaveChangesAsync();
            
            var controller = CreateController(context);
            var payment = new CreatePaymentDto { UserId = 1, BookingId = 1, Amount = 2000, PaymentMethod = "Card" };

            var result = await controller.MakePayment(payment);

            var ok = result as OkObjectResult;
            Assert.That(ok, Is.Not.Null);
            Assert.That(ok!.Value, Is.EqualTo("Payment successful!"));
        }
    }
}
