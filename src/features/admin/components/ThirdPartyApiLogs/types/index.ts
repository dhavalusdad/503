export interface ThirdPartyApiLog {
  id: string;
  service_name: string;
  operation_type: string;
  request_url: string;
  request_method: string;
  request_headers: Record<string, unknown>;
  request_body: string;
  response_status_code: number;
  response_headers: Record<string, unknown>;
  response_body: string;
  success: boolean;
  error_message: string | null;
  duration_ms: number;
  created_at: string;
  updated_at: string;
  appointment_id?: string;
}
