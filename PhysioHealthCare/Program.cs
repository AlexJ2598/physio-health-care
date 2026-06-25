using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PhysioHealthCare.Application.Interfaces;
using PhysioHealthCare.Application.Responses;
using PhysioHealthCare.Application.Services;
using PhysioHealthCare.Application.Validators.Patients;
using PhysioHealthCare.Infrastructure.Data;
using PhysioHealthCare.Infrastructure.Repositories;
using PhysioHealthCare.Infrastructure.Security;
using PhysioHealthCare.Middleware;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)

.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {

            ValidateIssuer = true,

            ValidateAudience = true,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,


            ValidIssuer =
            builder.Configuration["JwtSettings:Issuer"],


            ValidAudience =
            builder.Configuration["JwtSettings:Audience"],


            IssuerSigningKey =
                new SymmetricSecurityKey(

                Encoding.UTF8.GetBytes(

                builder.Configuration["JwtSettings:Key"]!))
        };
});

builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1",
        new OpenApiInfo
        {
            Title = "PhysioHealthCare API",
            Version = "v1"
        });

    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",

            Description =
                "JWT Authorization header using the Bearer scheme.\n\n" +
                "Enter your token below.\n\n" +
                "Example:\n" +
                "eyJhbGciOiJIUzI1NiIs...",

            In = ParameterLocation.Header,

            Type = SecuritySchemeType.Http,

            Scheme = "Bearer",

            BearerFormat = "JWT"
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreatePatientDtoValidator>();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Values
            .SelectMany(value => value.Errors)
            .Select(error => error.ErrorMessage)
            .ToList();

        var response = new ErrorResponse
        {
            StatusCode = StatusCodes.Status400BadRequest,
            Message = string.Join(" | ", errors),
            Path = context.HttpContext.Request.Path,
            Method = context.HttpContext.Request.Method,
            TraceId = context.HttpContext.TraceIdentifier
        };

        return new BadRequestObjectResult(response);
    };
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();