# Areeb Event Booking System

<div align="center">
<img src="https://img.shields.io/badge/Status-Active-success" alt="Status">
<img src="https://img.shields.io/badge/Python-3.12+-blue" alt="Python Version">
<img src="https://img.shields.io/badge/License-MIT-green" alt="License">

**A full-stack web application for event management, built with Django REST Framework backend and vanilla JavaScript frontend.**
</div>

<div align="center">

### ⚠️ IMPORTANT NOTICE ⚠️
**[See Test Credentials](#test-credentials) and [External Services](#external-services) sections for critical setup information**

</div>

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
- [Unit Testing](#unit-testing)
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

> ⚠️ **IMPORTANT**: This project relies on external services that need to be configured properly.

<table>
<tr>
<th align="center">🌐 External Service</th>
<th align="center">⚙️ Configuration</th>
</tr>
<tr>
<td>

### Cloudinary
Used for image hosting and management

</td>
<td>

1. Create a Cloudinary account at https://cloudinary.com/
2. Get your Cloud Name, API Key, and API Secret
3. Configure in `.env` file as shown in `.env.example`

</td>
</tr>
<tr>
<td>

### PostgreSQL Database
For production database (SQLite used for development)

</td>
<td>

1. Create a PostgreSQL database
2. Update database connection details in `.env` file
3. See `.env.example` for configuration format

</td>
</tr>
</table>

**Note**: Refer to `.env.example` in the Backend directory for the complete configuration structure.

## Test Credentials

> ⚠️ **IMPORTANT**: Use these credentials to test the application locally with SQLite

<div align="center">

<table>
<tr>
<th align="center">👑 Admin Dashboard</th>
<th align="center">👤 User Website</th>
</tr>
<tr>
<td>

```
Email: admin@gmail.com
Password: 123
```

Access at: `/Frontend/templates/dashboard-login.html`

</td>
<td>

```
Email: test_user@gmail.com
Password: test_password@1234
```

Access at: `/Frontend/templates/login.html`

</td>
</tr>
</table>

</div>

## Email Verification

> ⚠️ **IMPORTANT**: The system sends verification emails that need to be configured

<div align="center">
<img src="https://img.shields.io/badge/Email_Verification-Required-important" alt="Email Verification Required">
</div>

The signup process includes email verification:

1. When a user registers, a verification email is sent to their email address
2. To enable this feature in your development environment, you need to:
   - Configure email settings in the `.env` file
   - Provide your SMTP server details (or use console backend for testing)
   - In development mode without proper email configuration, check your console output for the verification link

## Unit Testing

<div align="center">
<img src="https://img.shields.io/badge/Tests-Automated-success" alt="Tests Automated">
</div>

The project includes a comprehensive suite of unit tests to ensure functionality works as expected:

```bash
# Navigate to the Backend directory
cd Backend

# Run all tests
python manage.py test

# Run tests for a specific app
python manage.py test events
python manage.py test accounts
python manage.py test tickets
```

Test coverage includes:
- User authentication and registration
- Event creation, retrieval, updates and deletion
- Ticket booking functionality
- Permission controls
- API endpoint validation

Running tests regularly helps ensure that code changes don't introduce regressions.

## Security Features

- JWT-based authentication
- Role-based access control
- Secure password handling
- CSRF protection