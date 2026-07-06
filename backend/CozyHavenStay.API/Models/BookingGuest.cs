using System.ComponentModel.DataAnnotations;

namespace CozyHavenStay.API.Models
{
    // BOOKINGGUEST DATABASE TABLE
    public class BookingGuest
    {
        [Key]
        public int GuestId { get; set; }
        public int BookingId { get; set; }
        public string? GuestName { get; set; }
        public int Age { get; set; }
        public bool IsAdult { get; set; } = true;
        public decimal ExtraCharge { get; set; } = 0;
        public Booking? Booking { get; set; }
    }
}
