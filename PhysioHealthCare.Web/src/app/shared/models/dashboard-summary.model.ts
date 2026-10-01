export interface DashboardSummary {
  todayAppointments: number;
  todayScheduled: number;
  todayInProgress: number;
  todayCompleted: number;

  historicalCompleted: number;
  historicalCancelled: number;

  currentAppointment: DashboardAppointment | null;
  nextAppointment: DashboardAppointment | null;
}

export interface DashboardAppointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  reason: string;
  status: number;
}