using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Services
{
    public interface IPaymentService
    {
        Task<IEnumerable<Payment>> GetPaymentsByUserAsync(int userId);
        Task<string> MakePaymentAsync(CreatePaymentDto dto);
    }
}
