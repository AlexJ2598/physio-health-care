export interface ClinicalHistory {
  id: string;
  clinicalRecordId: string;

  // Reason for consultation and current condition
  chiefComplaint: string;
  currentCondition: string | null;
  conditionOnsetDate: string | null;
  injuryMechanism: string | null;

  // Medical history
  relevantMedicalHistory: string | null;
  previousSurgeries: string | null;
  previousInjuries: string | null;
  allergies: string | null;
  currentMedications: string | null;

  // Medical information
  medicalDiagnosis: string | null;
  referringPhysician: string | null;
  previousStudies: string | null;

  // Initial physical therapy assessment
  painLevel: number | null;
  functionalLimitations: string | null;
  physicalTherapyAssessment: string | null;
  physicalTherapyDiagnosis: string | null;

  // General observations
  notes: string | null;

  // Audit fields
  createdAt: string;
  updatedAt: string | null;
}

export type CreateClinicalHistory = Omit<
  ClinicalHistory,
  'id' | 'clinicalRecordId' | 'createdAt' | 'updatedAt'
>;

export type UpdateClinicalHistory = CreateClinicalHistory;
