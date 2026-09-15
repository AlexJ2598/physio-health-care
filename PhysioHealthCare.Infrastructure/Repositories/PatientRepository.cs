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
            if (context == null)
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
                .ThenBy(patient => patient.LastName)
                .ThenBy(patient => patient.Id)
                .ToListAsync();
        }

        public async Task<Patient?> GetByIdAsync(Guid id)
        {
            return await _context.Patients
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    patient =>
                        patient.Id == id &&
                        patient.IsActive
                );
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
            return await _context.Patients
                .FirstOrDefaultAsync(
                    patient =>
                        patient.IsActive &&
                        patient.Id == id
                );
        }

        public async Task<bool> SoftDeleteAsync(Guid id)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(
                    patient =>
                        patient.Id == id &&
                        patient.IsActive
                );

            if (patient == null)
            {
                return false;
            }

            patient.IsActive = false;
            patient.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<(IReadOnlyList<Patient> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search,
            string? sortBy,
            string? sortDirection)
        {
            var query = _context.Patients
                .AsNoTracking()
                .Where(patient => patient.IsActive);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim();

                query = query.Where(patient =>
                    patient.FirstName.Contains(searchTerm) ||
                    patient.LastName.Contains(searchTerm) ||
                    (patient.FirstName + " " + patient.LastName)
                        .Contains(searchTerm) ||
                    patient.Email.Contains(searchTerm) ||
                    patient.PhoneNumber.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();

            var normalizedSortBy =
                sortBy?.Trim().ToLowerInvariant();

            var descending =
                string.Equals(
                    sortDirection,
                    "desc",
                    StringComparison.OrdinalIgnoreCase
                );

            query = normalizedSortBy switch
            {
                "birthdate" =>
                    descending
                        ? query
                            .OrderByDescending(
                                patient => patient.BirthDate
                            )
                            .ThenBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            )
                        : query
                            .OrderBy(
                                patient => patient.BirthDate
                            )
                            .ThenBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            ),

                "gender" =>
                    descending
                        ? query
                            .OrderByDescending(
                                patient => patient.Gender
                            )
                            .ThenBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            )
                        : query
                            .OrderBy(
                                patient => patient.Gender
                            )
                            .ThenBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            ),

                "email" =>
                    descending
                        ? query
                            .OrderByDescending(
                                patient => patient.Email
                            )
                            .ThenBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            )
                        : query
                            .OrderBy(
                                patient => patient.Email
                            )
                            .ThenBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            ),

                "phonenumber" =>
                    descending
                        ? query
                            .OrderByDescending(
                                patient => patient.PhoneNumber
                            )
                            .ThenBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            )
                        : query
                            .OrderBy(
                                patient => patient.PhoneNumber
                            )
                            .ThenBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            ),

                "fullname" =>
                    descending
                        ? query
                            .OrderByDescending(
                                patient => patient.FirstName
                            )
                            .ThenByDescending(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            )
                        : query
                            .OrderBy(
                                patient => patient.FirstName
                            )
                            .ThenBy(
                                patient => patient.LastName
                            )
                            .ThenBy(
                                patient => patient.Id
                            ),

                _ =>
                    query
                        .OrderBy(
                            patient => patient.FirstName
                        )
                        .ThenBy(
                            patient => patient.LastName
                        )
                        .ThenBy(
                            patient => patient.Id
                        )
            };

            var patients = await query
                .Skip(
                    (pageNumber - 1) *
                    pageSize
                )
                .Take(pageSize)
                .ToListAsync();

            return (
                patients,
                totalCount
            );
        }
    }
}