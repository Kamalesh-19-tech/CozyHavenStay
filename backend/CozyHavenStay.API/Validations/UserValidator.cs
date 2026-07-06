using FluentValidation;
using CozyHavenStay.API.Models;

namespace CozyHavenStay.API.Validations
{
    public class UserValidator : AbstractValidator<User>
    {
        public UserValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full Name is required.")
                .Length(3, 50).WithMessage("Full Name must be between 3 and 50 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email is required.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone Number is required.")
                .Matches(@"^\d{10}$").WithMessage("Phone number must be exactly 10 digits.");
                
            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required.");
        }
    }
}
