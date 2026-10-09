using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioHealthCare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClinicalRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClinicalRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecordNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicalRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClinicalRecords_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClinicalHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClinicalRecordId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChiefComplaint = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CurrentCondition = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ConditionOnsetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InjuryMechanism = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RelevantMedicalHistory = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    PreviousSurgeries = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    PreviousInjuries = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Allergies = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CurrentMedications = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MedicalDiagnosis = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ReferringPhysician = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PreviousStudies = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    PainLevel = table.Column<int>(type: "int", nullable: true),
                    FunctionalLimitations = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    PhysicalTherapyAssessment = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PhysicalTherapyDiagnosis = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicalHistories", x => x.Id);
                    table.CheckConstraint("CK_ClinicalHistories_PainLevel", "[PainLevel] IS NULL OR ([PainLevel] >= 0 AND [PainLevel] <= 10)");
                    table.ForeignKey(
                        name: "FK_ClinicalHistories_ClinicalRecords_ClinicalRecordId",
                        column: x => x.ClinicalRecordId,
                        principalTable: "ClinicalRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClinicalHistories_ClinicalRecordId",
                table: "ClinicalHistories",
                column: "ClinicalRecordId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClinicalRecords_PatientId",
                table: "ClinicalRecords",
                column: "PatientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClinicalRecords_RecordNumber",
                table: "ClinicalRecords",
                column: "RecordNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClinicalHistories");

            migrationBuilder.DropTable(
                name: "ClinicalRecords");
        }
    }
}
