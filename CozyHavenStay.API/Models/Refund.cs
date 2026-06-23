namespace CozyHavenStay.API.Models
{
    // REFUND DATABASE TABLE
    public class Refund
    {
        public int RefundId { get; set; }
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public decimal RefundAmount { get; set; }
        public DateTime RefundDate { get; set; } = DateTime.Now;
        public string RefundStatus { get; set; } = "Pending";
        public string Reason { get; set; }
        public Booking Booking { get; set; }
        public User User { get; set; }
    }
}
