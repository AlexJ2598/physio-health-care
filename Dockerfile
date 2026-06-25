FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["PhysioHealthCare/PhysioHealthCare.csproj", "PhysioHealthCare/"]
COPY ["PhysioHealthCare.Application/PhysioHealthCare.Application.csproj", "PhysioHealthCare.Application/"]
COPY ["PhysioHealthCare.Domain/PhysioHealthCare.Domain.csproj", "PhysioHealthCare.Domain/"]
COPY ["PhysioHealthCare.Infrastructure/PhysioHealthCare.Infrastructure.csproj", "PhysioHealthCare.Infrastructure/"]

RUN dotnet restore "PhysioHealthCare/PhysioHealthCare.csproj"

COPY . .

RUN dotnet publish "PhysioHealthCare/PhysioHealthCare.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "PhysioHealthCare.dll"]