using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;
using CozyHavenStay.API.Services;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace CozyHavenStay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        // REGISTER
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto userDto)
        {
            _logger.LogInformation("Register attempt for email: {Email}", userDto.Email);
            
            var result = await _authService.RegisterAsync(userDto);
            if (result == "Email already exists!")
            {
                _logger.LogWarning("Registration failed - email already exists: {Email}", userDto.Email);
                return BadRequest(result);
            }

            return Ok(result);
        }

        // LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var (token, role, fullName, userId) = await _authService.LoginAsync(login);

            if (token == null)
                return Unauthorized("Invalid email or password!");

            return Ok(new { token, role, fullName, userId });
        }

        // CHECK EMAIL 
        [HttpPost("check-email")]
        public async Task<IActionResult> CheckEmail([FromBody] CheckEmailDto dto)
        {
            var exists = await _authService.CheckEmailAsync(dto.Email);
            if (!exists)
                return NotFound("No account found with this email!");
            
            return Ok("Email found!");
        }

        // RESET PASSWORD 
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var success = await _authService.ResetPasswordAsync(dto);
            if (!success)
                return NotFound("No account found with this email!");

            return Ok("Password reset successfully!");
        }
    }
}
