# CozyHavenStay - Hotel Booking Management Platform

CozyHavenStay is a full-stack web application designed for booking hotels, rooms, and managing property operations. The platform offers dedicated interfaces for Guests, Hotel Owners, and Super Administrators.

## Project Structure

This repository is organized as a monorepo:
* **`backend/`**: ASP.NET Core Web API (C#) built using Entity Framework Core, SQL Server database integration, and unit tests using Moq.
* **`frontend/`**: Interactive User Interface built with React, standard Vanilla CSS layout components, and context routers.

---

## Getting Started

Follow the instructions below to run both the backend and frontend services locally.

### Prerequisites
* **Backend**: [.NET 10.0 SDK](https://dotnet.microsoft.com/download), [SQL Server LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb) or Express.
* **Frontend**: [Node.js (v18+)](https://nodejs.org/) & npm.

---

### Running the Backend API
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Restore NuGet dependencies:
   ```bash
   dotnet restore
   ```
3. Run the migrations to seed the database schemas:
   ```bash
   dotnet ef database update --project CozyHavenStay.API
   ```
4. Run the Web API project:
   ```bash
   dotnet run --project CozyHavenStay.API
   ```
   * Access the Swagger API documentation endpoint locally at: `https://localhost:7077/swagger`

---

### Running the Frontend UI
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   * Open `http://localhost:3000` to view the website in your browser.

---

## Core Features & Roles

### 👤 Guest User
* Account registration and profile editing.
* Search hotels by city, view room availability and pricing details.
* Book rooms, input companion guests, and complete secure simulated checkout.
* Confirm bookings and access stay history.

### 🏨 Hotel Owner
* Manage hotel profiles and list property details.
* Add, update, or remove room configurations (base price, size, beds).
* View guest reservations, manage check-in dates, and accept booking approvals.
* Monitor sales dashboard metrics.

### 👑 Super Administrator
* Access platform-wide operation logs.
* Monitor properties performance charts (revenue shares, bookings volume).
* Verify new hotels and moderate guest reviews.
* Manage registered users database records.
