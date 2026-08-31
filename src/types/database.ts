import { Application, CreateApplicationDTO, UpdateApplicationDTO } from './application';
import { Followup } from './followup';
import { FollowupSettings, UpdateSettingsDTO } from './settings';
import { Profile, UpdateProfileDTO } from './profile';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: UpdateProfileDTO;
      };
      settings: {
        Row: FollowupSettings;
        Insert: Omit<FollowupSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: UpdateSettingsDTO;
      };
      applications: {
        Row: Application;
        Insert: CreateApplicationDTO & { user_id: string };
        Update: UpdateApplicationDTO;
      };
      followups: {
        Row: Followup;
        Insert: Omit<Followup, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Followup, 'id' | 'application_id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
