export const jsonStringify = <T>(value: T, defaultValue: ''): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return defaultValue;
  }
};

export * from './dateUtils';

export const jsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
};


export const storageHelper = (type: 'local' | 'session' = 'local') => {
  const storage = type === 'session' ? sessionStorage : localStorage;
  // Store data
  return {
    setItem: <T>(key: string, data: T, storageType = 'local'): void => {
      try {
        const jsonData = jsonStringify(data, '');
        if (storageType === 'local') storage.setItem(key, jsonData);
      } catch {
        // Handle storage errors silently or log them
      }
    },

    // Retrieve data with optional default value
    getItem: <T>(key: string, defaultValue: T) => {
      const storedData = storage.getItem(key);
      if (!storedData) {
        return defaultValue; // Return the default value if no data is found
      }
      return jsonParse(storedData?.toString(), defaultValue);
    },

    // Remove data
    removeItem: (key: string): void => {
      try {
        storage.removeItem(key);
      } catch {
        // Handle errors silently
      }
    }
  };
};
