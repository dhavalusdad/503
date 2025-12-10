import type { IconNameType } from '@/stories/Common/Icon';

export interface ConversationsListProps {
  conversations: ChatSession[];
  activeChat: ChatSession | null;
  onSelectChat: (chat: ChatSession) => void;
}
export interface ChatInterfaceProps {
  activeChat: ChatSession | null;
  messages: MessageType[];
  onMessageUpate: (messageData: MessageType) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: IconNameType;
  action: string;
  color?: string;
}

export interface Recipient {
  id: string;
  user_id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  email: string;
  is_online: boolean;
  profile_image: string | null;
  type: 'therapist' | 'client' | string; // adjust if there are only fixed values
}

export interface LastMessage {
  id: string;
  content: string;
  message_type: 'Text' | 'Image' | string; // add other types if needed
  sender_id: string;
  is_own: boolean;
  delivery_status: DeliveryStatus;
  created_at: string; // can be Date if you parse it on client
}

export interface ChatSession {
  id: string;
  appointment_id: string;
  tenant_id: string;
  status: 'Open' | 'Closed' | string; // extend if you have more statuses
  unread_count: number;
  is_mute: boolean;
  closed_at: string | null;
  recipient: Recipient;
  last_message?: LastMessage; // optional because it might be null
}

export type DeliveryStatus = 'Sent' | 'Delivered' | 'Read';

export interface MessageType {
  id: string;
  chat_id: string;
  sender_id: string;
  message_type: 'Text' | 'Image' | 'Video' | 'File';
  content: string;
  file_urls: string[] | null;
  delivery_status: DeliveryStatus;
  is_read: boolean;
  is_own: boolean;
  created_at: string;
}

export interface ReadInfoType {
  sessionId: string;
  messageIds: string[];
}

export interface ConversationItemProps {
  conversation: ChatSession;
  isActive: boolean;
  onSelect: (chat: ChatSession) => void;
  userTimezone: string;
  handleCollapse: (status: boolean) => void;
}

export interface StatusMenuProps {
  isVisible: boolean;
  onMenuClick: (action: string) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export interface PresenceUpdate {
  userId: string;
  isOnline: boolean;
}

export interface PaginatedMessages {
  pages: { items: MessageType[] }[];
  pageParams: unknown[];
}

export interface ChatHeaderProps {
  activeChat: ChatSession;
  handleCloseSearch: () => void;
  handleChangeSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  messageSearchValue: string;
  searchResult: ChatSearchResult[];
  activeMessageSearchData: ChatSearchResult | null;
  handleActiveMessageSearchData: (data: ChatSearchResult | null) => void;
  handleCollapse: (status: boolean) => void;
  chatId: string;
  onActiveChatSessionUpdate: <K extends keyof ChatSession>(key: K, value: ChatSession[K]) => void;
}

export interface MessageBubbleProps {
  message: MessageType;
  userTimezone: string;
  searchTerm?: string;
  isHighlighted?: boolean;
}

export interface MessageInputProps {
  messageText: string;
  selectedFiles: File[];
  fileError: string;
  onMessageChange: (text: string) => void;
  onFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onAttachClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  removeFile: (text: number) => void;
  isSendingMessage: boolean;
}

export interface ChatSearchResult {
  page: number;
  message: MessageType;
}

export interface ChatSearchResponseType {
  results: ChatSearchResult[];
  total: number;
}

export interface ChatMessagesPage {
  items: MessageType[];
  total: number;
  nextPage?: number;
  prevPage?: number;
}

export interface MessageMarkedAsReadEventType {
  messageIds: string[];
  sessionId: string;
}

export interface ChatSessionsPage {
  items: ChatSession[];
  nextPage?: number;
  prevPage?: number;
  total: number;
}
