namespace CozyHavenStay.API.Models
{
    // PAYMENT DATABASE TABLE
    public class Payment
    {
        public int PaymentId { get; set; }
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public string? PaymentMethod { get; set; } = "Online";
        public string? PaymentStatus { get; set; } = "Success";
        public Booking? Booking { get; set; }
        public User? User { get; set; }
    }
}
