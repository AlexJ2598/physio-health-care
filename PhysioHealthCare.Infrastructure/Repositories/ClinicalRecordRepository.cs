namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
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

            await _context.SaveChangesAsync();

            return record.Entity;
        }

        public Task<bool> ExistsForPatientIdAsync(Guid patientId)
        {
            return _context.ClinicalRecords
                .AnyAsync(cr =>
                    cr.PatientId == patientId &&
                    cr.IsActive);
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