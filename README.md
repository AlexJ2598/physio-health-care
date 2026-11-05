# 🏥 PhysioHealthCare

### Full-Stack Physiotherapy Clinic Management System

PhysioHealthCare is a full-stack healthcare management application built with **ASP.NET Core 9, Angular 22, Entity Framework Core, and SQL Server**, following Clean Architecture principles.

The platform is designed to help physiotherapy clinics manage patients, appointments, and clinical information through a secure, centralized, and user-friendly system.

The project includes a RESTful Web API, a modern Angular frontend, JWT-based authentication, role-based authorization, automated testing, and a fully operational CI/CD pipeline using GitHub Actions and Microsoft Azure.

---

## 🚀 Key Features

### 👥 Patient Management

- Create and register patients
- Update patient information
- Soft delete patients while preserving records
- Retrieve individual patient details
- List active patients
- Validate patient information using FluentValidation
- Manage patients through an Angular interface

### 📅 Appointment Management

- Create appointments
- Update appointment information
- Delete appointments
- Retrieve appointments by ID
- View appointment listings
- Manage appointments through the frontend

### 🩺 Clinical History

- Clinical history functionality integrated into the application
- Dedicated Angular views and routes
- Backend integration for clinical information management

### 📊 Dashboard

- Centralized dashboard interface
- Integrated navigation between application modules
- Access to patient and appointment management

### 🔐 Authentication & Authorization

- JWT Bearer Authentication
- Role-based authorization
- Admin and Therapist roles
- Secure password hashing
- Protected API endpoints
- Angular authentication guards
- HTTP interceptor for JWT authorization headers
- Session management and logout functionality
- Restricted access to authenticated application routes

### 🌐 Angular Frontend

- Angular 22 with standalone components
- TypeScript
- Responsive application layout
- Patient creation and editing forms
- Appointment management screens
- Clinical history views
- Dashboard
- Route guards
- HTTP interceptors
- Form validation and error handling
- Loading indicators and user feedback
- Custom 404 page
- SPA navigation fallback for Azure Static Web Apps

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| Backend | ASP.NET Core 9, C# |
| Frontend | Angular 22, TypeScript, HTML, CSS |
| Database | SQL Server, Entity Framework Core 9 |
| Architecture | Clean Architecture |
| Authentication | JWT Bearer Authentication |
| Authorization | Role-Based Access Control |
| Validation | FluentValidation |
| Testing | xUnit, Moq, FluentAssertions |
| API Documentation | Swagger / OpenAPI |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Backend Hosting | Azure App Service |
| Frontend Hosting | Azure Static Web Apps |
| Source Control | Git, GitHub |

---

## 🏛 Architecture

PhysioHealthCare follows Clean Architecture principles, separating business logic, application services, infrastructure, and presentation concerns.

```text
PhysioHealthCare/
│
├── PhysioHealthCare/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Program.cs
│   └── appsettings.json
│
├── PhysioHealthCare.Application/
│   ├── DTOs/
│   ├── Interfaces/
│   ├── Services/
│   └── Validators/
│
├── PhysioHealthCare.Domain/
│   ├── Entities/
│   └── Enums/
│
├── PhysioHealthCare.Infrastructure/
│   ├── Data/
│   ├── Repositories/
│   ├── Security/
│   └── Configurations/
│
├── PhysioHealthCare.Tests/
│
├── PhysioHealthCare.Web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   ├── features/
│   │   │   ├── layout/
│   │   │   └── shared/
│   │   └── environments/
│   ├── public/
│   ├── angular.json
│   └── package.json
│
└── .github/
    └── workflows/
        ├── dotnet-ci.yml
        ├── backend-cd.yml
        └── frontend-cd.yml
```

### Architecture Layers

**Domain:** Contains core business entities, enums, and domain concepts.

**Application:** Implements business use cases, DTOs, validation, interfaces, and application services.

**Infrastructure:** Handles persistence, database access, repository implementations, and security infrastructure.

**API:** Exposes RESTful endpoints, configures middleware, and handles HTTP requests.

**Frontend:** Provides the user interface and communicates with the backend through HTTP APIs.

**Tests:** Validates application behavior using automated unit tests.

---

## 🔐 Security

PhysioHealthCare uses JWT-based authentication and role-based authorization.

Supported roles:

- **Admin:** Administrative access to authorized functionality.
- **Therapist:** Access to permitted clinical and patient-management operations.

Protected API requests require an authorization header:

```http
Authorization: Bearer <access_token>
```

Security-related functionality includes:

- Password hashing
- JWT token validation
- Role-based endpoint restrictions
- Protected frontend routes
- Centralized API error handling
- Configurable CORS policies
- Environment-based application configuration

---

## 🐳 Local Development

### Backend

Restore dependencies:

```bash
dotnet restore
```

Build the solution:

```bash
dotnet build
```

Run the API:

```bash
dotnet run --project PhysioHealthCare
```

Configure the required database connection string and JWT settings for your local environment before running the API.

### Frontend

Navigate to the Angular project:

```bash
cd PhysioHealthCare.Web
```

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm start
```

The frontend typically runs at:

```text
http://localhost:4200
```

### Docker

For the configured containerized environment:

```bash
docker compose up --build
```

Local Swagger documentation is available when Swagger is enabled in the API configuration.

---

## 🧪 Automated Testing

The backend uses:

- xUnit
- Moq
- FluentAssertions

Current unit test coverage includes:

- PatientService
- AppointmentService
- AuthService

Run the backend tests:

```bash
dotnet test --configuration Release
```

Build the Angular application:

```bash
cd PhysioHealthCare.Web
npm run build
```

The project has successfully completed a local run of **78 backend unit tests**, with zero failures.

---

## ☁️ Azure Cloud Deployment

PhysioHealthCare is deployed using Microsoft Azure.

### Backend — Azure App Service

**Resource:** `physiohealthcare-api-dev`

[Backend API](https://physiohealthcare-api-dev-f9etdvavcdejekce.westus3-01.azurewebsites.net)

The backend is deployed as an ASP.NET Core 9 application.

### Frontend — Azure Static Web Apps

**Resource:** `physiohealthcare-web-dev`

[Live Application](https://kind-water-07448d81e.3.azurestaticapps.net)

The Angular application is hosted on Azure Static Web Apps and communicates with the backend API.

Swagger documentation is controlled through environment-specific configuration and may be disabled in the deployed environment.

---

## 🔄 Continuous Integration & Continuous Deployment

PhysioHealthCare uses **GitHub Actions** to automate build validation, testing, and cloud deployment.

### Continuous Integration

Workflow: `.github/workflows/dotnet-ci.yml`

The CI pipeline:

1. Checks out the repository.
2. Configures .NET 9.
3. Restores backend dependencies.
4. Builds the .NET solution in Release mode.
5. Executes backend unit tests.
6. Configures Node.js 22.
7. Installs Angular dependencies using `npm ci`.
8. Builds the Angular application.

The backend and frontend validation jobs run independently.

### Backend Continuous Deployment

Workflow: `.github/workflows/backend-cd.yml`

After a successful CI run triggered by a push to `main`, the backend deployment workflow:

1. Checks out the validated commit.
2. Configures .NET 9.
3. Publishes the ASP.NET Core API in Release mode.
4. Authenticates using a protected GitHub Actions secret.
5. Deploys the application to Azure App Service.

### Frontend Continuous Deployment

Workflow: `.github/workflows/frontend-cd.yml`

After a successful CI run triggered by a push to `main`, the frontend deployment workflow:

1. Checks out the validated commit.
2. Configures Node.js 22.
3. Installs dependencies using `npm ci`.
4. Builds Angular for production.
5. Deploys the compiled application to Azure Static Web Apps.

### Deployment Workflow

```text
Feature Branch
      |
      v
Local Development & Testing
      |
      v
Pull Request
      |
      v
GitHub Actions CI
      |
      v
Merge into main
      |
      v
GitHub Actions CI
      |
      +----------------------+
      |                      |
      v                      v
Backend CD              Frontend CD
      |                      |
      v                      v
Azure App Service       Azure Static Web Apps
      |                      |
      +----------+-----------+
                 |
                 v
        PhysioHealthCare
```

Deployment credentials are stored securely using GitHub Actions repository secrets.

### Verified Pipeline Executions

- **PhysioHealthCare CI #85:** Successful
- **PhysioHealthCare Backend CD #2:** Successful
- **PhysioHealthCare Frontend CD #1:** Successful

The deployed application has also been manually validated for authentication, patient creation and editing, appointment viewing, and dashboard navigation.

---

## 🌿 Git Branching Strategy

Development follows a feature-branch workflow.

Example:

```bash
git switch main
git pull origin main
git switch -c feature/new-functionality
```

Changes are developed and tested independently before integration into `main`.

Feature branches trigger CI validation without automatically deploying to Azure.

After review and merge into `main`, successful CI execution triggers the backend and frontend deployment workflows.

---

## 📌 Roadmap

### Security & Authentication

- Refresh token support
- Enhanced authorization policies
- Security hardening and secrets management

### Clinical Features

- Expanded clinical history capabilities
- Treatment management
- Medical document uploads
- Additional clinical workflows

### Frontend & Mobile

- Angular lazy loading and bundle optimization
- UI/UX improvements
- Flutter mobile application
- Improved responsive layouts

### Architecture & Performance

- Integration tests
- End-to-end tests
- Redis caching
- MediatR / CQRS evaluation
- Database performance optimization

### DevOps & Observability

- Automated API health checks
- Post-deployment smoke tests
- GitHub branch protection
- Azure monitoring and logging
- Deployment optimization by changed component
- Improved deployment security

---

## 👨‍💻 Author

**Alexis Jonathan Hernández Bautista**

Computer Science Engineer

**Technical Focus:** C# • ASP.NET Core • Angular • Entity Framework Core • SQL Server • Azure • Docker • GitHub Actions • Clean Architecture

---

**PhysioHealthCare — Building a modern, secure, and scalable foundation for physiotherapy clinic management.**
