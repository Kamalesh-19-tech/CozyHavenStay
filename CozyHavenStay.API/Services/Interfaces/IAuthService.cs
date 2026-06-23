using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;

namespace CozyHavenStay.API.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDto userDto);
        Task<(string token, string role, string fullName, int userId)> LoginAsync(LoginDto login);
        Task<bool> CheckEmailAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
    }
}
