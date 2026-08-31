import { ApplicationSource } from '../types/application';

export const APPLICATION_SOURCES: { value: ApplicationSource; label: string }[] = [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Naukri', label: 'Naukri' },
  { value: 'Company Website', label: 'Company Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Recruiter', label: 'Recruiter' },
  { value: 'Email', label: 'Email' },
  { value: 'Other', label: 'Other' },
];
