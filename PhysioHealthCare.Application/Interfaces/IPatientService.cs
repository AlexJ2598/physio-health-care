using PhysioHealthCare.Application.DTOs.Patients;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhysioHealthCare.Application.Interfaces
{
    public interface IPatientService
    {
        Task<IReadOnlyList<PatientResponseDto>> GetAllAsync();

        Task<PatientResponseDto> CreateAsync(CreatePatientDto dto);
    }
}
