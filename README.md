# Areeb Event Booking System

A full-stack web application for event management, built with Django REST Framework backend and vanilla JavaScript frontend.

## Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Access](#access)
- [Features](#features)
- [API Documentation](#api-documentation)
- [External Services](#external-services)
- [Test Credentials](#test-credentials)
- [Email Verification](#email-verification)
- [Security Features](#security-features)

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

# first you need to activate the v env of the backend
cd Backend
poetry shell
cd ..

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

## External Services

This project uses the following external services:

### Cloudinary
The application uses Cloudinary for image hosting and management. You'll need to:
1. Create a Cloudinary account at https://cloudinary.com/
2. Get your Cloud Name, API Key, and API Secret
3. Configure these in your `.env` file based on the `.env.example` template

### PostgreSQL Database
By default, the project uses SQLite for development. For production, it's configured to use PostgreSQL:
1. Create a PostgreSQL database
2. Update the database connection details in your `.env` file based on the `.env.example` template

Refer to `.env.example` in the Backend directory for the complete configuration structure.

## Test Credentials

You can test the application locally using SQLite with these pre-configured accounts:

### Admin Dashboard Access
- **Email:** admin@gmail.com
- **Password:** 123
- **URL:** `/Frontend/templates/dashboard-login.html`

### User Website Access
- **Email:** test_user@gmail.com
- **Password:** test_password@1234
- **URL:** `/Frontend/templates/login.html`

## Email Verification

The signup process includes email verification:
1. When a user registers, a verification email is sent to their email address
2. To enable this feature in your development environment, you need to:
   - Configure email settings in the `.env` file
   - Provide your SMTP server details (or use console backend for testing)
   - In development mode without proper email configuration, check your console output for the verification link

## Security Features

- JWT-based authentication
- Role-based access control
- Secure password handling
- CSRF protection