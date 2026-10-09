
namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using PhysioHealthCare.Application.DTOs.ClinicalRecords;
    using PhysioHealthCare.Application.Interfaces;

    [ApiController]
    [Route("api/clinical-records/{clinicalRecordId:guid}/history")]
    [Authorize(Roles = "Admin,Therapist")]
    public class ClinicalHistoriesController : ControllerBase
    {
        private readonly IClinicalHistoryService _clinicalHistoryService;

        public ClinicalHistoriesController(
            IClinicalHistoryService clinicalHistoryService)
        {
            _clinicalHistoryService = clinicalHistoryService
                ?? throw new ArgumentNullException(
                    nameof(clinicalHistoryService));
        }

        [HttpGet]
        public async Task<ActionResult<ClinicalHistoryResponseDto>> GetByClinicalRecordId(
            Guid clinicalRecordId)
        {
            var clinicalHistory =
                await _clinicalHistoryService
                    .GetByClinicalRecordIdAsync(clinicalRecordId);

            if (clinicalHistory == null)
            {
                return NotFound();
            }

            return Ok(clinicalHistory);
        }

        [HttpPost]
        public async Task<ActionResult<ClinicalHistoryResponseDto>> Create(
            Guid clinicalRecordId,
            [FromBody] CreateClinicalHistoryDto dto)
        {
            var clinicalHistory =
                await _clinicalHistoryService.CreateAsync(
                    clinicalRecordId,
                    dto);

            return CreatedAtAction(
                nameof(GetByClinicalRecordId),
                new
                {
                    clinicalRecordId = clinicalHistory.ClinicalRecordId
                },
                clinicalHistory);
        }

        [HttpPut]
        public async Task<ActionResult<ClinicalHistoryResponseDto>> Update(
            Guid clinicalRecordId,
            [FromBody] UpdateClinicalHistoryDto dto)
        {
            var clinicalHistory =
                await _clinicalHistoryService.UpdateAsync(
                    clinicalRecordId,
                    dto);

            return Ok(clinicalHistory);
        }
    }
}

