import { DashboardSummary } from '../../shared/models/dashboard-summary.model';

type MetricKey = {
  [Key in keyof DashboardSummary]: DashboardSummary[Key] extends number ? Key : never;
}[keyof DashboardSummary];

interface DashboardMetric {
  readonly key: MetricKey;
  readonly labelKey: string;
}

interface TodayMetric extends DashboardMetric {
  readonly queryParams: { readonly today: true; readonly status?: number };
}

const APPOINTMENT_STATUS = {
  scheduled: 1,
  inProgress: 2,
  completed: 3,
} as const;

export const TODAY_METRICS: readonly TodayMetric[] = [
  {
    key: 'todayAppointments',
    labelKey: 'dashboard.today.appointments',
    queryParams: { today: true },
  },
  {
    key: 'todayScheduled',
    labelKey: 'dashboard.today.scheduled',
    queryParams: { today: true, status: APPOINTMENT_STATUS.scheduled },
  },
  {
    key: 'todayInProgress',
    labelKey: 'dashboard.today.inProgress',
    queryParams: { today: true, status: APPOINTMENT_STATUS.inProgress },
  },
  {
    key: 'todayCompleted',
    labelKey: 'dashboard.today.completed',
    queryParams: { today: true, status: APPOINTMENT_STATUS.completed },
  },
];

export const HISTORY_METRICS: readonly DashboardMetric[] = [
  { key: 'historicalCompleted', labelKey: 'dashboard.history.completed' },
  { key: 'historicalCancelled', labelKey: 'dashboard.history.cancelled' },
];
