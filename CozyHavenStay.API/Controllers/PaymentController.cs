using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Services;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // GET PAYMENTS BY USER
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetPaymentsByUser(int userId)
        {
            var payments = await _paymentService.GetPaymentsByUserAsync(userId);
            return Ok(payments);
        }

        // MAKE PAYMENT
        [HttpPost]
        public async Task<IActionResult> MakePayment([FromBody] CreatePaymentDto dto)
        {
            var message = await _paymentService.MakePaymentAsync(dto);
            return Ok(message);
        }
    }
}
