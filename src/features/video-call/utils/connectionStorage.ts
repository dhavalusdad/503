interface ConnectionDetails {
  token: string;
  identity: string;
  displayName: string;
  roomId: string;
  timestamp: number;
  retryCount: number;
}

const CONNECTION_STORAGE_KEY = 'twilio_connection_details';
const MAX_RETRY_COUNT = 3;
const STORAGE_EXPIRY_HOURS = 24;

export const saveConnectionDetails = (
  details: Omit<ConnectionDetails, 'timestamp' | 'retryCount'>
) => {
  const connectionDetails: ConnectionDetails = {
    ...details,
    timestamp: Date.now(),
    retryCount: 0,
  };

  try {
    sessionStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connectionDetails));
  } catch (error) {
    console.error('Failed to save connection details to sessionStorage:', error);
  }
};

export const getConnectionDetails = (): ConnectionDetails | null => {
  try {
    const stored = sessionStorage.getItem(CONNECTION_STORAGE_KEY);
    if (!stored) return null;

    const details: ConnectionDetails = JSON.parse(stored);

    // Check if storage has expired
    const now = Date.now();
    const expiryTime = details.timestamp + STORAGE_EXPIRY_HOURS * 60 * 60 * 1000;

    if (now > expiryTime) {
      clearConnectionDetails();
      return null;
    }

    // Check if retry count is exceeded
    if (details.retryCount >= MAX_RETRY_COUNT) {
      clearConnectionDetails();
      return null;
    }

    return details;
  } catch (error) {
    console.error('Failed to retrieve connection details from sessionStorage:', error);
    return null;
  }
};

export const incrementRetryCount = () => {
  try {
    const details = getConnectionDetails();
    if (details) {
      details.retryCount += 1;
      sessionStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(details));
    }
  } catch (error) {
    console.error('Failed to increment retry count:', error);
  }
};

export const clearConnectionDetails = () => {
  try {
    sessionStorage.removeItem(CONNECTION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear connection details from sessionStorage:', error);
  }
};

export const hasValidConnectionDetails = (): boolean => {
  const details = getConnectionDetails();
  return details !== null;
};
