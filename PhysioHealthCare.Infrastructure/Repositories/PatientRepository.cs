namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Infrastructure.Data;
    public class PatientRepository : IPatientRepository
    {
        private readonly AppDbContext _context;

        public PatientRepository(AppDbContext context)
        {
            if(context == null)
            {
              throw new ArgumentNullException(nameof(context));
            }
            _context = context;
        }

        public async Task<IReadOnlyList<Patient>> GetAllAsync()
        {
            return await _context.Patients
            .AsNoTracking()
            .Where(patient => patient.IsActive)
            .OrderBy(patient => patient.FirstName)
            .ToListAsync();
        }

        public async Task<Patient?> GetByIdAsync(Guid id)
        {
            return await _context.Patients.AsNoTracking().
                FirstOrDefaultAsync(patient => patient.Id == id && patient.IsActive);
        }

        public async Task<Patient> CreateAsync(Patient patient)
        {
            await _context.Patients.AddAsync(patient);
            await _context.SaveChangesAsync();
            return patient;

        }

        public async Task<Patient> UpdateAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
            return patient;
        }

        public async Task<Patient?> GetByIdForUpdateAsync(Guid id)
        {
            return await _context.Patients.
                FirstOrDefaultAsync(patient => patient.IsActive && patient.Id == id);
        }

        public async Task<bool> SoftDeleteAsync(Guid id)
        {
            var patient = await _context.Patients
           .FirstOrDefaultAsync(patient => patient.Id == id && patient.IsActive);

            if (patient == null)
            {
                return false;
            }
            patient.IsActive = false;
            patient.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;

        }
    }
}
