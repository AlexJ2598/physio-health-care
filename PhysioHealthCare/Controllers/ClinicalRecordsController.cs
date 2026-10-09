
namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using PhysioHealthCare.Application.DTOs.ClinicalRecords;
    using PhysioHealthCare.Application.Interfaces;

    [ApiController]
    [Route("api/patients/{patientId:guid}/clinical-record")]
    [Authorize]
    public class ClinicalRecordsController : ControllerBase
    {
        private readonly IClinicalRecordService _clinicalRecordService;

        public ClinicalRecordsController(
            IClinicalRecordService clinicalRecordService)
        {
            _clinicalRecordService = clinicalRecordService
                ?? throw new ArgumentNullException(
                    nameof(clinicalRecordService));
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Therapist")]
        public async Task<ActionResult<ClinicalRecordResponseDto>> GetByPatientId(
            Guid patientId)
        {
            var clinicalRecord =
                await _clinicalRecordService.GetByPatientIdAsync(patientId);

            if (clinicalRecord == null)
            {
                return NotFound();
            }

            return Ok(clinicalRecord);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Therapist")]
        public async Task<ActionResult<ClinicalRecordResponseDto>> Create(
            Guid patientId)
        {
            var clinicalRecord =
                await _clinicalRecordService.CreateAsync(patientId);

            return CreatedAtAction(
                nameof(GetByPatientId),
                new
                {
                    patientId = clinicalRecord.PatientId
                },
                clinicalRecord);
        }
    }
}
