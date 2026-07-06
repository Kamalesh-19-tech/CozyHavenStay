namespace CozyHavenStay.API.DTOs
{
    public class CreatePaymentDto
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = "Online";
    }
}
