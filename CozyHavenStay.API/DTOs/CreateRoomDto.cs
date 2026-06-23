namespace CozyHavenStay.API.DTOs
{
    // CREATE ROOM DATA TRANSFER
    public class CreateRoomDto
    {
        public int HotelId { get; set; }
        public string? RoomNumber { get; set; }
        public string? RoomSize { get; set; }
        public string? BedType { get; set; }
        public int MaxOccupancy { get; set; }
        public decimal BaseFare { get; set; }
        public bool IsAC { get; set; } = true;
    }
}
