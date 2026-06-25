# 🏥 PhysioHealthCare API

PhysioHealthCare is a RESTful Web API developed with ASP.NET Core 9 following Clean Architecture principles. The project aims to provide a backend solution for physiotherapy clinics, allowing patient and appointment management with secure authentication and role-based authorization.

---

## 🚀 Features

### Patients

* Create patients
* Update patients
* Soft delete patients
* Get patient by Id
* Get all active patients

### Appointments

* Create appointments
* Update appointments
* Delete appointments
* Get appointment by Id
* Get all appointments

### Authentication

* JWT Authentication
* Role-based Authorization
* Admin and Therapist roles
* Password hashing
* Swagger Bearer Authentication

---

## 🛠 Technologies

| Technology            | Version   |
| --------------------- | --------- |
| ASP.NET Core          | 9.0       |
| Entity Framework Core | 9.0       |
| SQL Server            | 2022      |
| xUnit                 | Latest    |
| Moq                   | Latest    |
| FluentAssertions      | Latest    |
| FluentValidation      | Latest    |
| Docker                | Latest    |
| Swagger               | OpenAPI 3 |
| GitHub Actions        | CI        |

---

## 🏛 Architecture

The project follows Clean Architecture principles.

```text
PhysioHealthCare.API
│
├── Controllers
├── Middleware
├── Configuration
│
PhysioHealthCare.Application
│
├── DTOs
├── Interfaces
├── Services
├── Validators
│
PhysioHealthCare.Domain
│
├── Entities
├── Enums
│
PhysioHealthCare.Infrastructure
│
├── Data
├── Repositories
├── Security
├── Configurations
│
PhysioHealthCare.Tests
```

---

## 🔐 Authentication

The API uses JWT Authentication.

Available roles:

* Admin
* Therapist

Protected endpoints require a valid Bearer Token.

Example:

```http
Authorization: Bearer eyJhbGciOi...
```

---

## 🐳 Docker

Run the entire application using Docker.

```bash
docker compose up --build
```

Swagger will be available at:

```text
http://localhost:8080/swagger
```

---

## 🧪 Testing

Execute unit tests:

```bash
dotnet test
```

Current tests cover:

* PatientService
* AppointmentService
* AuthService

Implemented using:

* xUnit
* Moq
* FluentAssertions

---

## 📌 Future Improvements

* Refresh Tokens
* Treatments Module
* Medical Records
* File Uploads
* Flutter Frontend
* Integration Tests
* Redis Cache
* MediatR / CQRS

---

## 👨‍💻 Author

Alexis Jonathan Hernández Bautista

Computer Science Engineer

ASP.NET Core • EF Core • SQL Server • Docker • JWT • Clean Architecture
