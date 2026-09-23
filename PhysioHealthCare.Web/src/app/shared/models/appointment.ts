export type AppointmentStatus =
  | 'Scheduled'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export type AppointmentStatusValue =
  | 1
  | 2
  | 3
  | 4;

export type AppointmentSortField =
  | 'appointmentDate'
  | 'patientName'
  | 'status'
  | 'reason';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  reason: string;
  notes: string | null;
  status: AppointmentStatus;
}

export interface CreateAppointment {
  patientId: string;
  appointmentDate: string;
  reason: string;
  notes?: string;
}

export interface UpdateAppointment {
  appointmentDate: string;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentStatus {
  status: AppointmentStatusValue;
}

export interface AppointmentFilters {
  patientId?: string;
  status?: AppointmentStatusValue;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: AppointmentSortField;
  sortDirection?: 'asc' | 'desc';
}