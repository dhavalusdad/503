import type { QuestionTypeEnum } from '@/enums';

import type { FileItem } from '../backofficeQueue/types';

export type QuestionType = 'short-answer' | 'radio' | 'select' | 'textarea' | 'number';

export interface QuestionOption {
  id: string;
  uid: string;
  created_at?: string;
  updated_at?: string;
  option_text: string;
  order_index: number;
  question_id: string;
  option_value: string;
}

export interface LabelValue {
  label: string;
  value: string;
}

export type ValueType = string | null | QuestionOption | LabelValue[] | FileItem[];

export interface DynamicQuestion {
  uid: string;
  id: string;
  value: ValueType;
  question_text: string;
  question_type: QuestionTypeEnum;
  is_required: boolean;
  placeholder?: string;
  order_index?: number;
  options?: QuestionOption[];
  metadata?: {
    field_type?: string;
    dependent_on?: {
      question_number: number;
      option_value: string;
    };
  };
}

export interface DynamicForm {
  uid: string;
  id: string;
  name: string;
  description?: string;
  questions: DynamicQuestion[];
  form_type: string;
}

export interface DynamicFormResponse {
  form_id: string;
  id?: string;
  response_obj: object;
}
export interface FormBuilderProps {
  initialForm?: DynamicForm;
  onSave?: (form: DynamicForm) => void;
  onPreview?: (form: DynamicForm) => void;
}

export interface QuestionEditorProps {
  question: DynamicQuestion;
  onUpdate: (question: DynamicQuestion) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  index: number;
  allQuestions: DynamicQuestion[];
}

export interface OptionsManagerProps {
  options: QuestionOption[];
  onUpdate: (options: QuestionOption[]) => void;
  questionType: QuestionType;
}

export interface FormPreviewProps {
  formData: DynamicForm | null;
  ispreviewType?: boolean;
  readOnly?: boolean;
  formDataLoading?: boolean;
  handleOnSubmit?: (answers: DynamicFormResponse) => void;
  handleOnCancel?: () => void;
}

export interface FilePreviewModalProps {
  isOpen: boolean;
  files: FileItem[];
  initialIndex?: number;
  onClose: () => void;
}
