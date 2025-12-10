type TherapistAppointment = {
  id: string;
  status: string;
  session_type: string;
  sessions_count: number;
  video_room_name: string;
  amd_appointment_id: string | null;

  client: {
    id: string;
    amd_patient_id: string | null;
    user: {
      first_name: string;
      last_name: string;
      profile_image: string | null;
    };
  };

  therapist: {
    id: string;
    amd_provider_id: string | null;
    user: {
      id: string;
    };
    clinics: {
      therapist_id: string;
      clinic_address_id: string;
      clinic_address: {
        id: string;
        name: string;
        address: string;
        state_id: string;
        city_id: string;
        state: {
          id: string;
          name: string;
        };
        city: {
          id: string;
          name: string;
        };
      };
    }[];
  };

  therapy_type: {
    id: string;
    name: string;
  };

  appointment_area_of_focus: {
    area_of_focus?: {
      id: string;
      name: string;
    };
    area_of_focus_id: string;
  }[];

  slot: {
    id: string;
    start_time: string; // ISO Date
    end_time: string; // ISO Date
  };
};

export interface InfiniteAppointmentPageResponse {
  data: TherapistAppointment[];
  total: number;
  hasMore: boolean;
}
