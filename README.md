# Areeb Event Booking System

A full-stack web application for event management, built with Django REST Framework backend and vanilla JavaScript frontend.

## Project Structure

```
├── Backend/         # Django REST API
└── Frontend/        # HTML/CSS/JavaScript client
```

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.12 or higher
- Poetry (Python package manager)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/OmarAlaraby/ATC_01068664556.git
cd ATC_01068664556
```

### 2. Run the Application

Simply run the start script:

```bash
# Make the start script executable
chmod +x start.sh

# Run the application
./start.sh
```

This will:
1. Set up the Python environment and install dependencies
2. Start the backend server
3. Open the user and admin login pages in your default browser

## Access

After running the start script, the following pages will automatically open in your default browser:
- User Interface: `Frontend/templates/login.html`
- Admin Interface: `Frontend/templates/dashboard-login.html`

## Features

1. User Features
   - User registration and authentication
   - Browse and search events
   - Book tickets for events
   - View booked events

2. Admin Features
   - Secure admin dashboard
   - CRUD operations for events
   - Event image management
   - View bookings and user statistics

## API Documentation

For detailed API documentation, run the server and visit:
```
http://localhost:8000/docs/
```

## Security Features

- JWT-based authentication
- Role-based access control
- Secure password handling
- CSRF protection