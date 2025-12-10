export interface NoteCardProps {
  title: string;
  content: string;
  onSave?: ({
    title,
    content,
    is_draft,
  }: {
    title: string;
    content: string;
    is_draft: boolean;
  }) => void;
  updated_at: string;
}
