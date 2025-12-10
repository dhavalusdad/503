export interface CreditCard {
  cardNumber: string;
  expirationDate: string;
  cardType: string;
}

export interface PaymentInfo {
  creditCard: CreditCard;
  billTo?: {
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
}

export interface PaymentProfile {
  customerPaymentProfileId: string;
  payment: PaymentInfo;
  customerType?: string;
  defaultPaymentProfile?: boolean;
}

export interface CustomerPaymentProfileData {
  paymentProfiles: PaymentProfile[];
}

export interface CustomerPaymentProfileResponse {
  success: boolean;
  message: string;
  data: CustomerPaymentProfileData;
}

export interface PaymentProfileDetails {
  defaultPaymentProfile?: boolean;
  customerPaymentProfileId: string;
  payment: {
    creditCard: {
      cardNumber: string;
      cardType: string;
      expirationDate: string; // sometimes "XXXX" for masked
    };
  };
  billTo?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
}
