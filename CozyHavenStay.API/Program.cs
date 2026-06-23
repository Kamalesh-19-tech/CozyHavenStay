using CozyHavenStay.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddLog4Net();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration
        .GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



builder.Services.AddControllers(options =>
{
    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
});
builder.Services.AddScoped<CozyHavenStay.API.Services.IAuthService, CozyHavenStay.API.Services.AuthService>();
builder.Services.AddScoped<CozyHavenStay.API.Services.IAdminService, CozyHavenStay.API.Services.AdminService>();
builder.Services.AddScoped<CozyHavenStay.API.Services.IHotelService, CozyHavenStay.API.Services.HotelService>();
builder.Services.AddScoped<CozyHavenStay.API.Services.IRoomService, CozyHavenStay.API.Services.RoomService>();
builder.Services.AddScoped<CozyHavenStay.API.Services.IReviewService, CozyHavenStay.API.Services.ReviewService>();
builder.Services.AddScoped<CozyHavenStay.API.Services.IPaymentService, CozyHavenStay.API.Services.PaymentService>();
builder.Services.AddScoped<CozyHavenStay.API.Services.IBookingService, CozyHavenStay.API.Services.BookingService>();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo { Title = "CozyHaven Stay API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });

    c.AddSecurityRequirement(doc => new Microsoft.OpenApi.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", doc),
            new System.Collections.Generic.List<string>()
        }
    });
});

var app = builder.Build();

app.UseMiddleware<CozyHavenStay.API.Middlewares.ExceptionMiddleware>();
app.UseMiddleware<CozyHavenStay.API.Middlewares.LoggingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CozyHaven Stay API v1");
});

app.UseHttpsRedirection();

app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CozyHavenStay.API.Data.AppDbContext>();
    context.Database.Migrate();

    if (!context.Users.Any(u => u.Email == "admin@cozyhaven.com"))
    {
        context.Users.Add(new CozyHavenStay.API.Models.User
        {
            FullName = "Admin",
            Email = "admin@cozyhaven.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            PhoneNumber = "1234567890",
            Address = "HQ",
            Gender = "Other",
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.Now
        });
        context.SaveChanges();
    }

    var owner1 = context.Users.FirstOrDefault(u => u.Email == "owner@gmail.com");
    if (owner1 == null)
    {
        owner1 = new CozyHavenStay.API.Models.User
        {
            FullName = "G.KAMALESH",
            Email = "owner@gmail.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Owner123!"),
            PhoneNumber = "9876543210",
            Address = "Bangalore Office",
            Gender = "Male",
            Role = "HotelOwner",
            IsActive = true,
            CreatedAt = DateTime.Now
        };
        context.Users.Add(owner1);
        context.SaveChanges();
    }

    var owner2 = context.Users.FirstOrDefault(u => u.Email == "owner2@cozyhaven.com");
    if (owner2 == null)
    {
        owner2 = new CozyHavenStay.API.Models.User
        {
            FullName = "Secondary Hotel Owner",
            Email = "owner2@cozyhaven.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Owner123!"),
            PhoneNumber = "9876543211",
            Address = "Mumbai Office",
            Gender = "Female",
            Role = "HotelOwner",
            IsActive = true,
            CreatedAt = DateTime.Now
        };
        context.Users.Add(owner2);
        context.SaveChanges();
    }

    if (context.Hotels.Count() < 20)
    {
        context.BookingGuests.RemoveRange(context.BookingGuests);
        context.Payments.RemoveRange(context.Payments);
        context.Refunds.RemoveRange(context.Refunds);
        context.Bookings.RemoveRange(context.Bookings);
        context.Reviews.RemoveRange(context.Reviews);
        context.Rooms.RemoveRange(context.Rooms);
        context.Hotels.RemoveRange(context.Hotels);
        context.SaveChanges();

        var hotelsToSeed = new System.Collections.Generic.List<(int ownerId, string name, string loc, string desc, int stars, bool dining, bool parking, bool wifi, bool pool, bool gym, bool roomService)>
        {
            (owner1.UserId, "Orchid Retreat", "Chennai", "Luxury retreat in the heart of Chennai, steps away from business districts.", 5, true, true, true, true, true, true),
            (owner1.UserId, "Gardenia Inn", "Bangalore", "Boutique stays in the Silicon Valley of India with lush green gardens.", 4, true, true, true, false, true, false),
            (owner1.UserId, "Heritage Palace", "Mysore", "Royal stays and premium rooms close to the historic Mysore Palace.", 5, true, true, true, true, false, true),
            (owner1.UserId, "Blue Mist Resort", "Ooty", "Chilly mountainside views, premium cottages, and organic tea gardens.", 4, true, false, true, false, false, true),
            (owner1.UserId, "Sandy Dunes Resort", "Goa", "Beachside suites with private pool access and beach views.", 5, true, true, true, true, true, true),
            (owner1.UserId, "Spice Coast Villa", "Kochi", "Backwater-facing property with traditional Keralite architecture.", 4, true, true, true, true, false, false),
            (owner1.UserId, "Western Heights", "Mumbai", "Urban suites overlooking the beautiful Mumbai skyline.", 5, true, true, true, true, true, true),
            (owner1.UserId, "Deccan Heights", "Pune", "Comfortable business hotel located inside Hinjewadi IT hub.", 3, true, true, true, false, true, false),
            (owner1.UserId, "Pearl Vista", "Hyderabad", "Modern hotel with premium conference facilities and dining options.", 4, true, true, true, true, true, false),
            (owner1.UserId, "Capitol Heights", "Delhi", "Executive stay options in Connaught Place.", 5, true, true, true, true, true, true),
            (owner1.UserId, "Hillview Cottages", "Coimbatore", "Peaceful cottages close to the foothills of Western Ghats.", 3, false, true, true, false, false, false),
            (owner1.UserId, "Temple View Inn", "Madurai", "Traditional lodging steps away from Meenakshi Temple.", 4, true, true, true, false, false, false),

            (owner2.UserId, "Pink City Manor", "Jaipur", "Traditional Rajasthani stay with royal hospitality and folk performances.", 5, true, true, true, true, false, true),
            (owner2.UserId, "Taj View Lodge", "Agra", "Cozy rooms with stunning rooftop views of the historic Taj Mahal.", 4, true, true, true, false, false, false),
            (owner2.UserId, "Ganges Breeze", "Varanasi", "Serene spiritual retreat beside the holy river Ganges.", 3, false, true, true, false, false, false),
            (owner2.UserId, "Sabarmati Suites", "Ahmedabad", "Modern corporate suites close to the Riverfront walk.", 4, true, true, true, false, true, false),
            (owner2.UserId, "Diamond Plaza", "Surat", "Luxury business hotel in the heart of Surat's textile market.", 4, true, true, true, true, true, false),
            (owner2.UserId, "Lakeview Heights", "Bhopal", "Breathtaking views of the famous Upper Lake Bhopal.", 4, true, true, true, true, false, false),
            (owner2.UserId, "Pinewood Manor", "Chandigarh", "Clean, modern design inspired by city planning aesthetics.", 4, true, true, true, false, true, false),
            (owner2.UserId, "Grand Bengal Resort", "Kolkata", "Luxury heritage hotel with rich colonial style and fine dining.", 5, true, true, true, true, true, true)
        };

        foreach (var h in hotelsToSeed)
        {
            var hotel = new CozyHavenStay.API.Models.Hotel
            {
                OwnerId = h.ownerId,
                HotelName = h.name,
                Location = h.loc,
                Description = h.desc,
                StarRating = h.stars,
                HasDining = h.dining,
                HasParking = h.parking,
                HasWifi = h.wifi,
                HasPool = h.pool,
                HasGym = h.gym,
                HasRoomService = h.roomService,
                ImageUrl = null,
                IsActive = true,
                CreatedAt = DateTime.Now
            };
            context.Hotels.Add(hotel);
            context.SaveChanges(); // Save to generate HotelId

            context.Rooms.Add(new CozyHavenStay.API.Models.Room
            {
                HotelId = hotel.HotelId,
                RoomNumber = "101",
                RoomSize = "280",
                BedType = "Double Bed",
                MaxOccupancy = 4,
                BaseFare = 2800,
                IsAC = true,
                IsAvailable = true,
                CreatedAt = DateTime.Now
            });

            context.Rooms.Add(new CozyHavenStay.API.Models.Room
            {
                HotelId = hotel.HotelId,
                RoomNumber = "102",
                RoomSize = "420",
                BedType = "King Bed",
                MaxOccupancy = 6,
                BaseFare = 4500,
                IsAC = true,
                IsAvailable = true,
                CreatedAt = DateTime.Now
            });
            context.SaveChanges();
        }

        var guest1 = context.Users.FirstOrDefault(u => u.Email == "test@gmail.com");
        if (guest1 == null)
        {
            guest1 = new CozyHavenStay.API.Models.User
            {
                FullName = "test user",
                Email = "test@gmail.com",
                Password = BCrypt.Net.BCrypt.HashPassword("TestUser123!"),
                PhoneNumber = "1112223334",
                Address = "Test Address 1",
                Gender = "Male",
                Role = "Guest",
                IsActive = true,
                CreatedAt = DateTime.Now
            };
            context.Users.Add(guest1);
            context.SaveChanges();
        }

        var guest2 = context.Users.FirstOrDefault(u => u.Email == "john123@gmail.com");
        if (guest2 == null)
        {
            guest2 = new CozyHavenStay.API.Models.User
            {
                FullName = "john",
                Email = "john123@gmail.com",
                Password = BCrypt.Net.BCrypt.HashPassword("JohnUser123!"),
                PhoneNumber = "1112223335",
                Address = "Test Address 2",
                Gender = "Male",
                Role = "Guest",
                IsActive = true,
                CreatedAt = DateTime.Now
            };
            context.Users.Add(guest2);
            context.SaveChanges();
        }

        var guest3 = context.Users.FirstOrDefault(u => u.Email == "test123@gmail.com");
        if (guest3 == null)
        {
            guest3 = new CozyHavenStay.API.Models.User
            {
                FullName = "test user 2",
                Email = "test123@gmail.com",
                Password = BCrypt.Net.BCrypt.HashPassword("TestUser123!"),
                PhoneNumber = "1112223336",
                Address = "Test Address 3",
                Gender = "Female",
                Role = "Guest",
                IsActive = true,
                CreatedAt = DateTime.Now
            };
            context.Users.Add(guest3);
            context.SaveChanges();
        }

        var guest4 = context.Users.FirstOrDefault(u => u.Email == "kamal123@gmail.com");
        if (guest4 == null)
        {
            guest4 = new CozyHavenStay.API.Models.User
            {
                FullName = "kamal",
                Email = "kamal123@gmail.com",
                Password = BCrypt.Net.BCrypt.HashPassword("KamalUser123!"),
                PhoneNumber = "1112223337",
                Address = "Test Address 4",
                Gender = "Male",
                Role = "Guest",
                IsActive = true,
                CreatedAt = DateTime.Now
            };
            context.Users.Add(guest4);
            context.SaveChanges();
        }

        var guest5 = context.Users.FirstOrDefault(u => u.Email == "vijay@gamil.com");
        if (guest5 == null)
        {
            guest5 = new CozyHavenStay.API.Models.User
            {
                FullName = "vijay",
                Email = "vijay@gamil.com",
                Password = BCrypt.Net.BCrypt.HashPassword("VijayUser123!"),
                PhoneNumber = "1112223338",
                Address = "Test Address 5",
                Gender = "Male",
                Role = "Guest",
                IsActive = true,
                CreatedAt = DateTime.Now
            };
            context.Users.Add(guest5);
            context.SaveChanges();
        }

        var orchidRetreat = context.Hotels.FirstOrDefault(h => h.HotelName == "Orchid Retreat");
        if (orchidRetreat != null)
        {
            var room101 = context.Rooms.FirstOrDefault(r => r.HotelId == orchidRetreat.HotelId && r.RoomNumber == "101");
            var room102 = context.Rooms.FirstOrDefault(r => r.HotelId == orchidRetreat.HotelId && r.RoomNumber == "102");

            if (room101 != null && room102 != null)
            {
                var booking1 = new CozyHavenStay.API.Models.Booking
                {
                    UserId = guest1.UserId,
                    RoomId = room101.RoomId,
                    CheckInDate = DateTime.Parse("2026-06-04"),
                    CheckOutDate = DateTime.Parse("2026-06-09"),
                    NoOfRooms = 1,
                    NoOfAdults = 2,
                    NoOfChildren = 0,
                    TotalFare = 25410,
                    BookingStatus = "Completed",
                    BookingDate = DateTime.Parse("2026-06-04")
                };
                context.Bookings.Add(booking1);
                context.SaveChanges();

                var payment1 = new CozyHavenStay.API.Models.Payment
                {
                    BookingId = booking1.BookingId,
                    UserId = guest1.UserId,
                    Amount = 25410,
                    PaymentDate = DateTime.Parse("2026-06-04"),
                    PaymentMethod = "Online",
                    PaymentStatus = "Success"
                };
                context.Payments.Add(payment1);

                var booking2 = new CozyHavenStay.API.Models.Booking
                {
                    UserId = guest2.UserId,
                    RoomId = room102.RoomId,
                    CheckInDate = DateTime.Parse("2026-06-02"),
                    CheckOutDate = DateTime.Parse("2026-07-31"),
                    NoOfRooms = 1,
                    NoOfAdults = 2,
                    NoOfChildren = 0,
                    TotalFare = 227150,
                    BookingStatus = "Confirmed",
                    BookingDate = DateTime.Parse("2026-06-02")
                };
                context.Bookings.Add(booking2);
                context.SaveChanges();

                var payment2 = new CozyHavenStay.API.Models.Payment
                {
                    BookingId = booking2.BookingId,
                    UserId = guest2.UserId,
                    Amount = 227150,
                    PaymentDate = DateTime.Parse("2026-06-02"),
                    PaymentMethod = "Online",
                    PaymentStatus = "Success"
                };
                context.Payments.Add(payment2);

                context.Reviews.Add(new CozyHavenStay.API.Models.Review
                {
                    HotelId = orchidRetreat.HotelId,
                    UserId = guest1.UserId,
                    Rating = 5,
                    Comment = "Amazing stay, very clean!",
                    ReviewDate = DateTime.Now.AddDays(-2)
                });

                context.Reviews.Add(new CozyHavenStay.API.Models.Review
                {
                    HotelId = orchidRetreat.HotelId,
                    UserId = guest2.UserId,
                    Rating = 5,
                    Comment = "Excellent service and beautiful rooms!",
                    ReviewDate = DateTime.Now.AddDays(-1)
                });

                context.SaveChanges();
            }
        }

        var gardeniaInn = context.Hotels.FirstOrDefault(h => h.HotelName == "Gardenia Inn");
        if (gardeniaInn != null)
        {
            var r101 = context.Rooms.FirstOrDefault(r => r.HotelId == gardeniaInn.HotelId && r.RoomNumber == "101");
            if (r101 != null)
            {
                var booking = new CozyHavenStay.API.Models.Booking
                {
                    UserId = guest3.UserId,
                    RoomId = r101.RoomId,
                    CheckInDate = DateTime.Parse("2026-06-12"),
                    CheckOutDate = DateTime.Parse("2026-06-15"),
                    NoOfRooms = 1,
                    NoOfAdults = 2,
                    NoOfChildren = 0,
                    TotalFare = 8400,
                    BookingStatus = "Confirmed",
                    BookingDate = DateTime.Parse("2026-06-09")
                };
                context.Bookings.Add(booking);
                context.SaveChanges();

                context.Payments.Add(new CozyHavenStay.API.Models.Payment
                {
                    BookingId = booking.BookingId,
                    UserId = guest3.UserId,
                    Amount = 8400,
                    PaymentDate = DateTime.Parse("2026-06-09"),
                    PaymentMethod = "UPI",
                    PaymentStatus = "Success"
                });

                context.Reviews.Add(new CozyHavenStay.API.Models.Review
                {
                    HotelId = gardeniaInn.HotelId,
                    UserId = guest3.UserId,
                    Rating = 4,
                    Comment = "Lovely gardens and calm environment.",
                    ReviewDate = DateTime.Now
                });
                context.SaveChanges();
            }
        }

        var heritagePalace = context.Hotels.FirstOrDefault(h => h.HotelName == "Heritage Palace");
        if (heritagePalace != null)
        {
            var r102 = context.Rooms.FirstOrDefault(r => r.HotelId == heritagePalace.HotelId && r.RoomNumber == "102");
            if (r102 != null)
            {
                var booking = new CozyHavenStay.API.Models.Booking
                {
                    UserId = guest4.UserId,
                    RoomId = r102.RoomId,
                    CheckInDate = DateTime.Parse("2026-06-05"),
                    CheckOutDate = DateTime.Parse("2026-06-07"),
                    NoOfRooms = 1,
                    NoOfAdults = 2,
                    NoOfChildren = 0,
                    TotalFare = 9000,
                    BookingStatus = "Completed",
                    BookingDate = DateTime.Parse("2026-06-01")
                };
                context.Bookings.Add(booking);
                context.SaveChanges();

                context.Payments.Add(new CozyHavenStay.API.Models.Payment
                {
                    BookingId = booking.BookingId,
                    UserId = guest4.UserId,
                    Amount = 9000,
                    PaymentDate = DateTime.Parse("2026-06-01"),
                    PaymentMethod = "Credit Card",
                    PaymentStatus = "Success"
                });

                context.Reviews.Add(new CozyHavenStay.API.Models.Review
                {
                    HotelId = heritagePalace.HotelId,
                    UserId = guest4.UserId,
                    Rating = 5,
                    Comment = "Royal stay, highly recommended!",
                    ReviewDate = DateTime.Now.AddDays(-3)
                });
                context.SaveChanges();
            }
        }

        var sandyDunes = context.Hotels.FirstOrDefault(h => h.HotelName == "Sandy Dunes Resort");
        if (sandyDunes != null)
        {
            var r102 = context.Rooms.FirstOrDefault(r => r.HotelId == sandyDunes.HotelId && r.RoomNumber == "102");
            if (r102 != null)
            {
                var booking = new CozyHavenStay.API.Models.Booking
                {
                    UserId = guest5.UserId,
                    RoomId = r102.RoomId,
                    CheckInDate = DateTime.Parse("2026-06-10"),
                    CheckOutDate = DateTime.Parse("2026-06-15"),
                    NoOfRooms = 1,
                    NoOfAdults = 2,
                    NoOfChildren = 0,
                    TotalFare = 22500,
                    BookingStatus = "Confirmed",
                    BookingDate = DateTime.Parse("2026-06-05")
                };
                context.Bookings.Add(booking);
                context.SaveChanges();

                context.Payments.Add(new CozyHavenStay.API.Models.Payment
                {
                    BookingId = booking.BookingId,
                    UserId = guest5.UserId,
                    Amount = 22500,
                    PaymentDate = DateTime.Parse("2026-06-05"),
                    PaymentMethod = "Online",
                    PaymentStatus = "Success"
                });

                context.Reviews.Add(new CozyHavenStay.API.Models.Review
                {
                    HotelId = sandyDunes.HotelId,
                    UserId = guest5.UserId,
                    Rating = 5,
                    Comment = "Private beach access was amazing!",
                    ReviewDate = DateTime.Now.AddDays(-4)
                });
                context.SaveChanges();
            }
        }
    }
}

app.Run();
