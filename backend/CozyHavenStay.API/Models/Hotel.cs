using System.ComponentModel.DataAnnotations;

namespace CozyHavenStay.API.Models
{
    // HOTEL DATABASE TABLE
    public class Hotel
    {
        public int HotelId { get; set; }
        public int OwnerId { get; set; }

        [Required(ErrorMessage = "Hotel Name is required")]
        [StringLength(150, MinimumLength = 3, ErrorMessage = "Hotel name must be between 3 and 150 characters")]
        public string HotelName { get; set; }

        [Required(ErrorMessage = "Location is required")]
        public string Location { get; set; }

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; }

        [Range(1, 5, ErrorMessage = "Star Rating must be between 1 and 5")]
        public int StarRating { get; set; }

        public bool HasDining { get; set; } = false;
        public bool HasParking { get; set; } = false;
        public bool HasWifi { get; set; } = true;
        public bool HasPool { get; set; } = false;
        public bool HasGym { get; set; } = false;
        public bool HasRoomService { get; set; } = false;
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public User? Owner { get; set; }
    }
}
