namespace CozyHavenStay.API.DTOs
{
    // BOOKINGREQUESTDTO DATA TRANSFER
    public class BookingRequestDto
    {
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NoOfRooms { get; set; } = 1;
        public List<GuestDto>? Guests { get; set; } = new List<GuestDto>();
    }
}
