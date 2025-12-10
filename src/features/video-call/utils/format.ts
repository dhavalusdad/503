export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  // Same day
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Older
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

export function generateRoomId(): string {
  const adjectives = [
    'happy',
    'bright',
    'calm',
    'swift',
    'gentle',
    'brave',
    'clever',
    'kind',
    'peaceful',
    'joyful',
    'vibrant',
    'serene',
    'bold',
    'wise',
    'cheerful',
  ];

  const nouns = [
    'room',
    'space',
    'hall',
    'chamber',
    'lounge',
    'studio',
    'office',
    'den',
    'parlor',
    'salon',
    'gallery',
    'workshop',
    'library',
    'sanctuary',
    'haven',
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);

  return `${adjective}-${noun}-${number}`;
}

export function validateRoomName(roomName: string): string | null {
  if (!roomName.trim()) {
    return 'Room name is required';
  }

  if (roomName.length < 3) {
    return 'Room name must be at least 3 characters';
  }

  if (roomName.length > 50) {
    return 'Room name must be less than 50 characters';
  }

  if (!/^[a-zA-Z0-9\-_\s]+$/.test(roomName)) {
    return 'Room name can only contain letters, numbers, spaces, hyphens, and underscores';
  }

  return null;
}

export function validateDisplayName(displayName: string): string | null {
  if (!displayName.trim()) {
    return 'Display name is required';
  }

  if (displayName.length < 2) {
    return 'Display name must be at least 2 characters';
  }

  if (displayName.length > 30) {
    return 'Display name must be less than 30 characters';
  }

  return null;
}
