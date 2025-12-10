export interface PasswordFormInterface {
  createPassword: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// Interface for the registration form
export interface RegistrationFormInterface {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  clinicName: string;
  password: string;
  dob: string;
  token: string | null;
}

export interface TherapistRegisterCredentials {
  new_password: string;
  token: string | null;
  timezone: string;
}

export interface VerifyOtpCredentials {
  otp_code: string;
  token: string | null;
}

export interface Note {
  id: string;
  title?: string;
  content?: string;
  is_draft: true;
  client: {
    user: {
      first_name: string;
      last_name: string;
      profile_image?: string;
    };
  };
  appointment: {
    id: string;
  };
}

export type SafetyPlanFormData = {
  warningSigns: string;
  internalCoping: string;
  safeEnvironment: string;
  reasonsLiving: string;
  hopesDreams: string;
  otherMeans: string;

  distractionPeople: { name: string }[];
  distractionPlaces: { place: string }[];
  helpPeople: { name: string }[];
  professionals: { contact: string }[];

  firearms: {
    ownGuns: string;
    howMany: string;
    howStored: string;
    howLongOwned: string;
    supportPersonName: string;
    gunsLocation: string;
    phone: string;
    storePerson: string;
    keysHolder: string;
    moveHelper: string;
    moveLocation: string;
    barriers: string;
    timetablePerson: string;
    timetableDate: string;
  };

  medications: {
    stockpiled: string;
    supportPersonName: string;
    location: string;
    phone: string;
    removePlanPerson1: string;
    removePlanPerson2: string;
    lockBoxDrugs: string;
    lockBoxHelper: string;
  };
};

export interface TherapistAppointment {
  id: string;
  status: string;
  sessions_count: string;
  client: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  therapy_type: {
    id: string;
    name: string;
  };
  session_type: string;
  appointment_area_of_focus: Array<{
    area_of_focus_id: string;
    session_type: string;
    area_of_focus: {
      id: string;
      name: string;
    };
  }>;
  slot: {
    id: string;
    start_time: string;
    end_time: string;
  };
  therapist: {
    id: string;
  };
  clinic_address: {
    id: string;
    name: string;
    address: string;
    state: { name: string };
    city: { name: string };
  };
  video_room_name: string;
}

export interface InfiniteAppointmentListResponse {
  data: TherapistAppointment[];
  total: number;
  hasMore: boolean;
}

export interface InfiniteTherapistAppointmentResponse {
  pages: InfiniteAppointmentListResponse[];
  pageParams: number[];
}
