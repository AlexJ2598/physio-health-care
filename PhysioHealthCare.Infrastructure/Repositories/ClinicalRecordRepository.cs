namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.Data.SqlClient;
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Infrastructure.Data;

    public class ClinicalRecordRepository : IClinicalRecordRepository
    {
        private readonly AppDbContext _context;

        public ClinicalRecordRepository(AppDbContext appDbContext)
        {
            if (appDbContext == null)
            {
                throw new ArgumentNullException(nameof(appDbContext));
            }

            _context = appDbContext;
        }


        public async Task<ClinicalRecord> CreateAsync(
            ClinicalRecord clinicalRecord)
        {
            var record =
                _context.ClinicalRecords.Add(clinicalRecord);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException exception)
                when (
                    exception.InnerException is SqlException sqlException &&
                    (sqlException.Number == 2601 ||
                     sqlException.Number == 2627))
            {
                var recordExists =
                    await _context.ClinicalRecords
                        .AsNoTracking()
                        .AnyAsync(cr =>
                            cr.PatientId == clinicalRecord.PatientId);

                if (recordExists)
                {
                    throw new ConflictException(
                        "Patient already has a clinical record.");
                }

                throw;
            }

            return record.Entity;
        }

        public Task<bool> ExistsForPatientIdAsync(Guid patientId)
        {
            return _context.ClinicalRecords
                .AnyAsync(cr =>
                    cr.PatientId == patientId);
        }

        public Task<ClinicalRecord?> GetByIdAsync(Guid id)
        {
            return _context.ClinicalRecords
                .AsNoTracking()
                .Include(cr => cr.ClinicalHistory)
                .FirstOrDefaultAsync(cr =>
                    cr.Id == id &&
                    cr.IsActive);
        }

        public Task<ClinicalRecord?> GetByPatientIdAsync(Guid patientId)
        {
            return _context.ClinicalRecords
                .AsNoTracking()
                .Include(cr => cr.ClinicalHistory)
                .FirstOrDefaultAsync(cr =>
                    cr.PatientId == patientId &&
                    cr.IsActive);
        }

        public async Task<long> GetNextRecordNumberAsync()
        {
            var connection =
                _context.Database.GetDbConnection();

            await _context.Database.OpenConnectionAsync();

            try
            {
                await using var command =
                    connection.CreateCommand();

                command.CommandText =
                    "SELECT NEXT VALUE FOR ClinicalRecordNumberSequence";

                var result =
                    await command.ExecuteScalarAsync();

                return Convert.ToInt64(result);
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }
        }
    }
}