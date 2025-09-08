
export interface ServiceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  license_plate: string;
  vin: string;
  year: number;
  serviceHistory: ServiceRecord[];
  pricing: {
    perDay: number;
    perHour?: number;
  };
  stk_date: string;
  insurance_info: string;
  vignette_until: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_card_number: string;
  drivers_license_number: string;
  drivers_license_image_path?: string | null;
}

export interface Rental {
  id: string;
  vehicleId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'active' | 'completed' | 'pending';
  customer_signature?: string;
  company_signature?: string;
  digital_consent_at?: string | null;
}

export interface RentalRequest {
    id: string;
    customer_details: Omit<Customer, 'id' | 'drivers_license_image_path'>;
    drivers_license_image_base64: string | null;
    digital_consent_at: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
