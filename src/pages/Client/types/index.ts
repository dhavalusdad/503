import type { OptionType } from '@/api/types/field-option.dto';
import type {
  DateRangeFilterObjType,
  NumberRangeFilterObjType,
} from '@/components/layout/Filter/types';
import type { OptionTypeGlobal } from '@/stories/Common/Select';
import type { TagsDataType } from '@/stories/Common/TagsCell/types';

export type TherapistClientsListDataType = {
  id: string;
  appointment_count: string;
  chat_session_id: string | null;
  full_name: string;
  joined_date: string;
  tags: TagsDataType[];
  action: React.ReactNode;
};

export type MyClientsFilterDataType = {
  alertTags?: OptionTypeGlobal[];
  joined_date?: DateRangeFilterObjType;
  session_completed_count: NumberRangeFilterObjType;
  is_long_term_patient: OptionType;
};
