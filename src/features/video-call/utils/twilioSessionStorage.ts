export interface TwilioSessionDetails {
  token?: string;
  identity?: string;
  displayName?: string;
  room?: string;
  audioInputId?: string;
  roomSid?: string;
  videoInputId?: string;
  audioOutputId?: string;
  lastRoom?: string;
  role?: string;
  participantType?: string;
  userId?: string;
  connectionDetails?: {
    token: string;
    identity: string;
    displayName: string;
    room: string;
    timestamp: number;
    retryCount: number;
  };
}

const TWILIO_SESSION_KEY = 'twilio_session_detail';

export function getTwilioSessionDetails(): TwilioSessionDetails {
  try {
    const stored = sessionStorage.getItem(TWILIO_SESSION_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to parse Twilio session details:', error);
    return {};
  }
}

export function updateTwilioSessionDetails(updates: Partial<TwilioSessionDetails>): void {
  try {
    const current = getTwilioSessionDetails();
    const updated = { ...current, ...updates };
    sessionStorage.setItem(TWILIO_SESSION_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update Twilio session details:', error);
  }
}

export function getTwilioSessionDetail<K extends keyof TwilioSessionDetails>(
  key: K
): TwilioSessionDetails[K] {
  const details = getTwilioSessionDetails();
  return details[key];
}

export function setTwilioSessionDetail<K extends keyof TwilioSessionDetails>(
  key: K,
  value: TwilioSessionDetails[K]
): void {
  updateTwilioSessionDetails({ [key]: value });
}

export function clearTwilioSessionDetails(): void {
  try {
    sessionStorage.removeItem(TWILIO_SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear Twilio session details:', error);
  }
}

export function clearTwilioSessionDetail<K extends keyof TwilioSessionDetails>(key: K): void {
  try {
    const current = getTwilioSessionDetails();
    delete current[key];
    sessionStorage.setItem(TWILIO_SESSION_KEY, JSON.stringify(current));
  } catch (error) {
    console.error('Failed to clear Twilio session detail:', error);
  }
}

export function getTwilioToken(): string | null {
  return getTwilioSessionDetail('token') || null;
}

export function setTwilioToken(token: string): void {
  setTwilioSessionDetail('token', token);
}

export function getTwilioIdentity(): string | null {
  return getTwilioSessionDetail('identity') || null;
}

export function setTwilioIdentity(identity: string): void {
  setTwilioSessionDetail('identity', identity);
}

export function getTwilioDisplayName(): string | null {
  return getTwilioSessionDetail('displayName') || null;
}

export function setTwilioDisplayName(displayName: string): void {
  setTwilioSessionDetail('displayName', displayName);
}

export function getTwilioRoom(): string | null {
  return getTwilioSessionDetail('room') || null;
}

export function setTwilioRoom(room: string): void {
  setTwilioSessionDetail('room', room);
}
export function getTwilioRoomSid(): string | null {
  return getTwilioSessionDetail('roomSid') || null;
}

export function clearTwilioSessionDetailsExceptIdentity(): void {
  try {
    const sessionData = sessionStorage.getItem(TWILIO_SESSION_KEY);
    if (sessionData) {
      const parsed: TwilioSessionDetails = JSON.parse(sessionData);
      const newSession: Partial<TwilioSessionDetails> = {};

      if (parsed.identity) {
        newSession.identity = parsed.identity;
        newSession.displayName = parsed.displayName;
        newSession.role = parsed.role;
      }

      sessionStorage.setItem(TWILIO_SESSION_KEY, JSON.stringify(newSession));
    }
  } catch (error) {
    console.error('Failed to clear Twilio session details except identity:', error);
  }
}

export function getTwilioUserId(): string | null {
  return getTwilioSessionDetail('userId') || null;
}
