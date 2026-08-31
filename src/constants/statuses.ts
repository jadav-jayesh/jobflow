import { ApplicationStatus } from '../types/application';

export const APPLICATION_STATUSES: {
  value: ApplicationStatus;
  label: string;
  color: 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error' | 'default';
  hex: string;
  isActive: boolean;
}[] = [
  { value: 'Applied', label: 'Applied', color: 'info', hex: '#0288d1', isActive: true },
  { value: 'HR Contact', label: 'HR Contact', color: 'warning', hex: '#ed6c02', isActive: true },
  { value: 'Interview', label: 'Interview', color: 'primary', hex: '#7b1fa2', isActive: true },
  { value: 'Selected', label: 'Selected', color: 'success', hex: '#2e7d32', isActive: false },
  { value: 'Rejected', label: 'Rejected', color: 'error', hex: '#d32f2f', isActive: false },
  { value: 'Withdrawn', label: 'Withdrawn', color: 'default', hex: '#757575', isActive: false },
];

export const ACTIVE_STATUSES: ApplicationStatus[] = ['Applied', 'HR Contact', 'Interview'];
export const INACTIVE_STATUSES: ApplicationStatus[] = ['Selected', 'Rejected', 'Withdrawn'];

export function isApplicationActive(status: ApplicationStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function getStatusConfig(status: ApplicationStatus) {
  return (
    APPLICATION_STATUSES.find((s) => s.value === status) || {
      value: status,
      label: status,
      color: 'default' as const,
      hex: '#757575',
      isActive: false,
    }
  );
}
