using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioHealthCare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceAppointmentIsCompletedWithStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Appointments",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.Sql(
                """
                UPDATE Appointments
                SET Status =
                    CASE
                        WHEN IsCompleted = 1 THEN 3
                        ELSE 1
                    END
                """);

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "Appointments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "Appointments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                """
                UPDATE Appointments
                SET IsCompleted =
                    CASE
                        WHEN Status = 3 THEN 1
                        ELSE 0
                    END
                """);

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Appointments");
        }
    }
}