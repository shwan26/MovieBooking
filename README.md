# MovieBooking

Customer
Page	Path	Purpose
HomePage	/	Browse movies
MovieDetailsPage	/movie/:movieId	View movie details
ShowtimePage	/movie/:movieId/showtime	Choose theater, format, date/time
SeatSelectionPage	/show/:showId/seats	Pick seats visually (color-coded)
CheckoutPage	/checkout	Booking summary before payment
PaymentPage	/payment	Choose method: credit, wallet, Thai QR
ConfirmationPage	/confirmation	Show ticket, QR code, seat info
CancelBookingPage	/cancel	Cancel before 2 hours of showtime

Admin
Feature	URL
🔐 Admin Login	/admin/login
📊 Dashboard	/admin/dashboard
🎬 Movie List	/admin/movies
➕ Add Movie	/admin/movies/new
🕒 Show Management	/admin/shows
📦 Booking Management	/admin/bookings


run the code
client - npm run dev
server - npx nodemon index.js


test in client
```npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom```

test in server
```npm i -D vitest supertest mongodb-memory-server @types/supertest```