export interface DashboardSummary {
  todayAppointments: number;
  todayScheduled: number;
  todayInProgress: number;
  todayCompleted: number;

  historicalCompleted: number;
  historicalCancelled: number;

  nextAppointment: NextAppointment | null;
}

export interface NextAppointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  reason: string;
  status: number;
}