namespace CozyHavenStay.API.DTOs
{
    public class CreateReviewDto
    {
        public int UserId { get; set; }
        public int HotelId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}
