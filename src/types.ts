

export interface ServiceRecord {
  id: number;
  date: string;
  description: string;
  cost: number;
}

export interface Vehicle {
  id: number;
  brand: string;
  license_plate: string;
  vin: string;
  year: number;
  serviceHistory?: ServiceRecord[];
  pricing: {
    day?: number;
    four_hour?: number;
    twelve_hour?: number;
    month?: number;
  };
  stk_date: string;
  insurance_info: string;
  vignette_until: string;
  created_at?: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_card_number: string;
  drivers_license_number: string;
  drivers_license_image_path?: string | null;
  created_at?: string;
}

export interface Rental {
  id: number;
  vehicle_id: number;
  customer_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'active' | 'completed' | 'pending';
  customer_signature?: string;
  company_signature?: string;
  digital_consent_at?: string | null;
  created_at?: string;
}

export interface RentalRequest {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    id_card_number: string;
    drivers_license_number: string;
    drivers_license_image_base64: string | null;
    digital_consent_at: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}