export const chatQueryKeys = {
  all: ['chat'] as const,
  sessions: () => ['chat', 'sessions'],
  messages: (sessionId: string) => ['chat', 'messages', sessionId],
  search: (sessionId: string, search: string) => ['chat', 'search', sessionId, search],
};
