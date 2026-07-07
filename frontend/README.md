# CozyHavenStay - Frontend React Application

This is the interactive frontend user interface of the CozyHavenStay platform, built using **React**, custom Vanilla CSS styles, and React Router.

## Technical Configuration

* **Core Engine**: React (Functional Components with hooks).
* **Styling**: Vanilla CSS with glassmorphism dashboard cards and layout alignments.
* **State Management**: React State and Context Providers.
* **Routing**: React Router DOM (`BrowserRouter` with `PrivateRoute` controllers).
* **API Service**: Axios integration connected to standard `api/[controller]` endpoints.

---

## Folder Structure

* **`src/`**: Main React codebase source.
  * `components/`: Reusable components (like `PrivateRoute.js` for role validation).
  * `types/`: Custom TypeScript/JavaScript shared interface declarations.
  * `pages/`: Core dashboard and booking flow pages:
    * `Home.js` / `Dashboard.js`: Main user search and landing views.
    * `Login.tsx` / `Register.tsx` / `ForgotPassword.js`: Authentication controls.
    * `HotelList.js` / `HotelDetail.js`: Property listings and room select views.
    * `Booking.js` / `Payment.js` / `BookingSuccess.js`: Checkout flow.
    * `OwnerDashboard.js` / `AddHotel.js` / `ManageRooms.js`: Owner forms.
    * `AdminDashboard.js` / `AdminBookings.js` / `AdminUsers.js`: Admin views.

---

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm start
   ```
   * The app will compile and open automatically in your browser at `http://localhost:3000`.

---

## Main Features Included

* **User Authentication**: Secure JWT storage and protected routes.
* **Hotel Search & Booking**: Date picker validations, room capacity calculations, and custom companion forms.
* **Interactive Checkout**: Built-in validations for card inputs and UPI formats.
* **Owner Controls**: Add properties, add/edit room pricing sheets, and confirm guest check-in lists.
* **SuperAdmin Operations**: Track overall system stats, monitor property performance charts, verify listings, and moderate reviews.
