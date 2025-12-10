import type React from 'react';

// export interface Transaction {
//   id: string;
//   select: React.ReactNode;
//   transactionid: string;
//   customerid: string;
//   type: 'Charge' | 'Refund';
//   amount: number | string;
//   status: 'Success' | 'Failed';
//   date: string;
//   sessiontype: string;
//   action: React.ReactNode;
// }

export interface Transaction {
  id: string;
  transaction_id?: string;
  transaction_type?: 'Charge' | 'Refund';
  client_id?: string;
  appointment_id?: string;
  amount?: string;
  status?: 'Success' | 'Failed' | 'Pending';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  appointment?: {
    id: string;
    session_type: string;
  };
  client?: {
    id: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
}

export interface AppointmentTableColumn {
  id: keyof Transaction;
  header: string;
  accessorKey: keyof Transaction;
  cell?: (value: Transaction[keyof Transaction]) => React.ReactNode;
}

interface Message {
  code: string;
  text?: string;
  description?: string;
}

interface ErrorItem {
  errorCode: string;
  errorText: string;
}

interface TransactionProfile {
  customerProfileId?: string;
  customerPaymentProfileId?: string;
}

interface TransactionResponse {
  profile?: TransactionProfile;
  transId?: string;
  authCode?: string;
  messages?: Message[];
  errors?: ErrorItem[];
  transHash?: string;
  refTransID?: string;
  accountType?: string;
  testRequest?: string;
  responseCode?: string;
  accountNumber?: string;
  avsResultCode?: string;
  cvvResultCode?: string;
  transHashSha2?: string;
  cavvResultCode?: string;
  networkTransId?: string;
  SupplementalDataQualificationIndicator?: number;
}

interface ResponseMessages {
  message?: Message[];
  resultCode?: string;
}

interface ResponseInfo {
  messages?: ResponseMessages;
  transactionResponse?: TransactionResponse;
}

export interface TransactionData {
  id: string;
  transaction_id: string;
  transaction_type: string;
  client_id: string;
  appointment_id: string;
  amount: string;
  status: string;
  is_partial_payment: boolean;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  response_info?: ResponseInfo;
}
