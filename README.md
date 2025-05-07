# Areeb-Competition-Project

# usecase diagram 
This diagram shows how two types of users (a regular **User** and an **Admin**) interact with the event booking system.


![image](https://github.com/user-attachments/assets/7c0f19a5-11b3-4d6c-9f0e-3e586ebf27ce)

### User Actions:
- SignUp: A new user can create an account.
  - This includes sending a verification email.

- SignIn: A user logs into the system.

- Book Event: A user books an event.
  - This includes creating a ticket for the event.

- List Tickets: A user can view all their tickets.
  - This can extend to View Single Ticket, which also allows seeing the event related to that ticket.

- List Events: A user can see all available events.
  - This includes viewing details of a single event.
  - 

### Admin Actions:
- Create Event: Admins can add new events.

- Update Event: Admins can modify existing events.

- Delete Event: Admins can remove events.
  - This includes deleting all tickets related to that event.

- List Events: Admins can also view all events (just like users).

---
# database schema
The database schema includes four main tables: users, tickets, events, and categories.

![image](https://github.com/user-attachments/assets/a745fc76-d49d-41b9-afb8-7b524edc89e6)

