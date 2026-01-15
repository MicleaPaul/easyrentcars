export type Language = 'de' | 'en' | 'fr' | 'it' | 'es' | 'ro';

export type TransmissionType = 'Manual' | 'Automatic';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
export type VehicleCategory = 'Economy' | 'Standard' | 'Premium' | 'Luxury';
export type VehicleStatus = 'available' | 'maintenance' | 'rented';

export type PaymentMethod = 'stripe' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export type PenaltyType = 'smoking' | 'late_return' | 'damage' | 'other';

export interface Vehicle {
  id: string;
  model: string;
  brand: string;
  year: number;
  transmission: TransmissionType;
  fuel_type: FuelType;
  seats: number;
  doors: number;
  category: VehicleCategory;
  price_per_day: number;
  images: string[];
  features: Record<string, boolean | string>;
  status: VehicleStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  vehicle_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_age: number;
  driving_experience?: number;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  pickup_location_address?: string;
  return_location_address?: string;
  total_price: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  stripe_payment_intent_id?: string;
  notes: string;
  language: Language;
  contract_url?: string;
  guest_link_token?: string;
  after_hours_fee: number;
  custom_location_fee: number;
  pickup_fuel_level?: number;
  return_fuel_level?: number;
  fuel_refund_due: boolean;
  fuel_charge_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Penalty {
  id: string;
  booking_id: string;
  type: PenaltyType;
  amount: number;
  description: string;
  applied_at: string;
  created_by: string;
}

export interface FAQ {
  id: string;
  question_de: string;
  answer_de: string;
  question_en: string;
  answer_en: string;
  question_fr: string;
  answer_fr: string;
  question_it: string;
  answer_it: string;
  question_es: string;
  answer_es: string;
  is_popular: boolean;
  display_order: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface TermsAndConditions {
  id: string;
  section_key: string;
  heading_de: string;
  heading_en: string;
  heading_fr: string;
  heading_it: string;
  heading_es: string;
  heading_ro: string;
  content_de: string[];
  content_en: string[];
  content_fr: string[];
  content_it: string[];
  content_es: string[];
  content_ro: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrivacyPolicy {
  id: string;
  section_key: string;
  heading_de: string;
  heading_en: string;
  heading_fr: string;
  heading_it: string;
  heading_es: string;
  heading_ro: string;
  content_de: string[];
  content_en: string[];
  content_fr: string[];
  content_it: string[];
  content_es: string[];
  content_ro: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  subject_de: string;
  body_de: string;
  subject_en: string;
  body_en: string;
  subject_fr: string;
  body_fr: string;
  subject_it: string;
  body_it: string;
  subject_es: string;
  body_es: string;
  enabled: boolean;
  channels: string[];
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  vat: string;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface RentalRules {
  min_age: number;
  min_driving_experience: number;
  after_hours_fee: number;
  custom_location_fee: number;
  currency: string;
}

export interface PenaltyConfig {
  amount: number;
  description: string;
  per?: string;
}

export interface FuelChargeRate {
  price_per_percent: number;
  currency: string;
  description?: string;
}
