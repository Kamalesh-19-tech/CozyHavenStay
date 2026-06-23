namespace CozyHavenStay.API.Models
{
    // BOOKING DATABASE TABLE
    public class Booking
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NoOfRooms { get; set; } = 1;
        public int NoOfAdults { get; set; } = 1;
        public int NoOfChildren { get; set; } = 0;
        public decimal TotalFare { get; set; }
        public string? BookingStatus { get; set; } = "Confirmed";
        public DateTime BookingDate { get; set; } = DateTime.Now;
        public User? User { get; set; }
        public Room? Room { get; set; }
    }
}
