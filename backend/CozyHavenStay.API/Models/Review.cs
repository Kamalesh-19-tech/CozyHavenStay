namespace CozyHavenStay.API.Models
{
    // REVIEW DATABASE TABLE
    public class Review
    {
        public int ReviewId { get; set; }
        public int UserId { get; set; }
        public int HotelId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime ReviewDate { get; set; } = DateTime.Now;
        public User User { get; set; }
        public Hotel Hotel { get; set; }
    }
}
