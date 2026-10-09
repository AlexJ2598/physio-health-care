namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Infrastructure.Data;

    public class ClinicalHistoryRepository : IClinicalHistoryRepository
    {
        private readonly AppDbContext _context;

        public ClinicalHistoryRepository(AppDbContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            _context = context;
        }

        public async Task<ClinicalHistory> CreateAsync(
            ClinicalHistory clinicalHistory)
        {
            var clinicalEntity =
                _context.ClinicalHistories.Add(clinicalHistory);

            await _context.SaveChangesAsync();

            return clinicalEntity.Entity;
        }

        public Task<bool> ExistsForClinicalRecordIdAsync(
            Guid clinicalRecordId)
        {
            return _context.ClinicalHistories
                .AnyAsync(ch =>
                    ch.ClinicalRecordId == clinicalRecordId &&
                    ch.IsActive);
        }

        public Task<ClinicalHistory?> GetByClinicalRecordIdAsync(
            Guid clinicalRecordId)
        {
            return _context.ClinicalHistories
                .AsNoTracking()
                .FirstOrDefaultAsync(ch =>
                    ch.ClinicalRecordId == clinicalRecordId &&
                    ch.IsActive);
        }

        public Task<ClinicalHistory?> GetByIdAsync(Guid id)
        {
            return _context.ClinicalHistories
                .AsNoTracking()
                .FirstOrDefaultAsync(ch =>
                    ch.Id == id &&
                    ch.IsActive);
        }

        public async Task<ClinicalHistory> UpdateAsync(
            ClinicalHistory clinicalHistory)
        {
            var clinicalEntity =
                _context.ClinicalHistories.Update(clinicalHistory);

            await _context.SaveChangesAsync();

            return clinicalEntity.Entity;
        }
    }
}