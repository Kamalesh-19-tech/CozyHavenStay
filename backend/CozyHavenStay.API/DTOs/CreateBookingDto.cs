namespace CozyHavenStay.API.DTOs
{
    public class CreateBookingDto
    {
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NoOfRooms { get; set; }
        public int NoOfAdults { get; set; }
        public int NoOfChildren { get; set; }
    }
}
