using CozyHavenStay.API.Data;
using CozyHavenStay.API.DTOs;
using CozyHavenStay.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CozyHavenStay.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // REGISTER USER
        public async Task<string> RegisterAsync(RegisterDto userDto)
        {
            try
            {
                var exists = await _context.Users.AnyAsync(u => u.Email == userDto.Email);
                if (exists) return "Email already exists!";

                var user = new User
                {
                    FullName = userDto.FullName,
                    Email = userDto.Email,
                    PhoneNumber = userDto.PhoneNumber,
                    Address = userDto.Address,
                    Gender = userDto.Gender,
                    Role = userDto.Role,
                    Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
                    CreatedAt = DateTime.Now,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return "Registration successful!";
            }
            catch (Exception)
            {
                throw;
            }
        }

        // LOGIN USER
        public async Task<(string token, string role, string fullName, int userId)> LoginAsync(LoginDto login)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == login.Email);
                if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
                    return (null, null, null, 0);

                var token = GenerateToken(user);
                return (token, user.Role, user.FullName, user.UserId);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // CHECK EMAIL EXISTS
        public async Task<bool> CheckEmailAsync(string email)
        {
            try
            {
                return await _context.Users.AnyAsync(u => u.Email == email);
            }
            catch (Exception)
            {
                throw;
            }
        }

        // RESET PASSWORD
        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (user == null) return false;

                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        // GENERATE JWT TOKEN
        private string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, user.Role!)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
