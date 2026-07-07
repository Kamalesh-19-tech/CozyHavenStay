# CozyHavenStay - Backend API Engine

The backend engine of CozyHavenStay is built with **ASP.NET Core Web API** using C# and Entity Framework Core. It exposes secure endpoints to handle auth, bookings, hotels, rooms, and payments.

## Technical Architecture

* **Database Mapper**: Entity Framework Core using SQL Server.
* **Architecture Style**: RESTful API Controller framework.
* **Security & Tokens**: JWT Bearer Token Authentication.
* **Logging System**: log4net integration with daily rolling file appenders.
* **Validation Middleware**: FluentValidation for clean DTO integrity checks.
* **Tests Framework**: NUnit unit testing using Mock objects via `Moq`.

---

## Folder Structure

* **`CozyHavenStay.API/`**: Core API Application codebase.
  * `Controllers/`: Handles incoming HTTP request routers (Admin, Auth, Booking, Hotel, Payment, Review, Room).
  * `Data/`: DBContext setup and seeds default schemas.
  * `DTOs/`: Data Transfer Objects for validation models.
  * `Models/`: Core database tables entity entities.
  * `Services/`: Core business logic service layers.
* **`CozyHavenStay.Tests/`**: NUnit Mock testing library containing 52 unit tests.

---

## Setting Up and Running

1. Open your terminal inside this folder:
   ```bash
   cd backend
   ```
2. Build the project solution:
   ```bash
   dotnet build
   ```
3. Update migrations to map the database structure locally:
   ```bash
   dotnet ef database update --project CozyHavenStay.API
   ```
4. Start the server development instance:
   ```bash
   dotnet run --project CozyHavenStay.API
   ```
   * Open `https://localhost:7077/swagger` in your browser to view and interact with the REST endpoints.

---

## Tests Suite Execution

To run the full suite of unit tests, execute this command from the `backend/` directory:
```bash
dotnet test
```
All 52 tests will compile, execute using in-memory mocked services, and verify business logic correctness.
