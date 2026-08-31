export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type UpdateProfileDTO = Partial<
  Omit<Profile, 'id' | 'created_at' | 'updated_at'>
>;
