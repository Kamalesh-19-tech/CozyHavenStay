namespace CozyHavenStay.API.Models
{
    // ROOM DATABASE TABLE
    public class Room
    {
        public int RoomId { get; set; }
        public int HotelId { get; set; }
        public string? RoomNumber { get; set; }
        public string? RoomSize { get; set; }
        public string? BedType { get; set; }
        public int MaxOccupancy { get; set; }
        public decimal BaseFare { get; set; }
        public bool IsAC { get; set; } = true;
        public bool IsAvailable { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Hotel? Hotel { get; set; }
    }
}
