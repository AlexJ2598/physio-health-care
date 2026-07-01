export interface Patient {
  id: string;
  fullName: string;
  birthDate: string;
  gender: number;
  phoneNumber: string;
  email: string;
}

export interface CreatePatient {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: number;
  phoneNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
}
export interface UpdatePatient {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: number;
  phoneNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface PatientDetail {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: number;
  phoneNumber: string;
  email: string;
  address: string;
  notes: string;
}