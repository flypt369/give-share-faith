export type NeedCategory = 'food' | 'shelter' | 'employment' | 'spiritual' | 'other';
export type GiftCategory = 'food' | 'shelter' | 'employment' | 'spiritual' | 'financial' | 'volunteer' | 'other';
export type GiverType = 'individual' | 'church' | 'business' | 'foundation' | 'corporation';
export type OrgType = 'church' | 'nonprofit' | 'business' | 'foundation';
export type UserRole = 'pastor' | 'church_admin' | 'verified_org' | 'super_admin';
export type StatusType = 'open' | 'matched' | 'fulfilled' | 'closed' | 'available' | 'committed' | 'delivered' | 'completed';
export type MatchStatus = 'suggested' | 'accepted' | 'completed' | 'declined';
export type UrgencyType = 'low' | 'medium' | 'high' | 'critical';
export type LanguageCode = 'en' | 'es' | 'ht' | 'zh';

export interface AnonymousSession {
  id: string;
  zip_code: string;
  language_preference: LanguageCode;
  created_at: string;
  last_active: string;
}

export interface Need {
  id: string;
  session_id: string | null;
  category: NeedCategory;
  description: string;
  zip_code: string;
  urgency: UrgencyType;
  status: StatusType;
  created_at: string;
  updated_at: string;
}

export interface Gift {
  id: string;
  session_id: string | null;
  giver_type: GiverType;
  org_id: string | null;
  category: GiftCategory;
  description: string;
  zip_code: string;
  quantity: string | null;
  tax_deductible_value: number | null;
  status: StatusType;
  created_at: string;
  updated_at: string;
}

export interface Prayer {
  id: string;
  session_id: string | null;
  request_text: string;
  generated_prayer: string | null;
  zip_code: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  org_type: OrgType;
  ein: string | null;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  zip_code: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  org_id: string;
  category: string;
  name: string;
  description: string;
  capacity: string | null;
  availability_schedule: Record<string, unknown> | null;
  zip_codes_served: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  need_id: string | null;
  gift_id: string | null;
  resource_id: string | null;
  match_score: number;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  zip_code: string;
  category: string;
  anonymized_text: string;
  active: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  org_id: string | null;
  created_at: string;
  last_login: string | null;
}

export interface PlatformConfig {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}
