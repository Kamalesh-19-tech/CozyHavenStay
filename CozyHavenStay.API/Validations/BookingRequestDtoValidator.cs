using FluentValidation;
using CozyHavenStay.API.DTOs;

namespace CozyHavenStay.API.Validations
{
    public class GuestDtoValidator : AbstractValidator<GuestDto>
    {
        public GuestDtoValidator()
        {
            RuleFor(x => x.GuestName)
                .NotEmpty().WithMessage("Guest name is required.");

            RuleFor(x => x.Age)
                .GreaterThan(0).WithMessage("Guest age must be greater than zero.");
        }
    }

    public class BookingRequestDtoValidator : AbstractValidator<BookingRequestDto>
    {
        public BookingRequestDtoValidator()
        {
            RuleFor(x => x.RoomId)
                .GreaterThan(0).WithMessage("Valid RoomId is required.");

            RuleFor(x => x.UserId)
                .GreaterThan(0).WithMessage("Valid UserId is required.");

            RuleFor(x => x.CheckInDate)
                .NotEmpty().WithMessage("Check-in date is required.")
                .GreaterThanOrEqualTo(System.DateTime.Today).WithMessage("Check-in date cannot be in the past.");

            RuleFor(x => x.CheckOutDate)
                .NotEmpty().WithMessage("Check-out date is required.")
                .GreaterThan(x => x.CheckInDate).WithMessage("Check-out date must be after check-in date.");

            RuleFor(x => x.NoOfRooms)
                .GreaterThan(0).WithMessage("Must book at least one room.");

            RuleFor(x => x.Guests)
                .NotEmpty().WithMessage("At least one guest is required.");

            RuleForEach(x => x.Guests).SetValidator(new GuestDtoValidator());
        }
    }
}
