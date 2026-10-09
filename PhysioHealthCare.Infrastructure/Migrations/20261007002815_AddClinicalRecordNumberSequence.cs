using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioHealthCare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClinicalRecordNumberSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "ClinicalRecordNumberSequence");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropSequence(
                name: "ClinicalRecordNumberSequence");
        }
    }
}
