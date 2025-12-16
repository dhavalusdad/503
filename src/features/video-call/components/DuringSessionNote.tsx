import { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { useCreateNote } from '@/api/note';
import { NoteType } from '@/enums';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import { RichTextEditorField } from '@/stories/Common/RichTextEditer';

// Define form data interface
interface FormData {
  title: string;
}
type DuringSessionNotePropsType = {
  appointment_id: string;
  client_id: string;
  therapist_id: string;
  tenant_id: string;
};

// Validation schema
const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
});

export const DuringSessionNote = ({
  appointment_id,
  client_id,
  therapist_id,
  tenant_id,
}: DuringSessionNotePropsType) => {
  const [content, setContent] = useState<string>('');
  const { mutateAsync: createNote, isPending } = useCreateNote(
    appointment_id!,
    NoteType.DuringAppointment,
    tenant_id
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
    },
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    await createNote({
      data: {
        appointment_id: appointment_id,
        therapist_id: therapist_id,
        client_id: client_id,
        title: data.title,
        content: content.trim(),
        is_draft: false,
        note_type: NoteType.DuringAppointment,
      },
    });
    reset();
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='relative mt-2.5 flex flex-col gap-5'>
      <InputField
        name='title'
        register={register}
        placeholder='Enter title'
        type='text'
        label='Title'
        isRequired
        labelClass='!text-base'
        inputClass='!text-base !leading-5'
        parentClassName='w-full'
        error={errors.title?.message}
      />
      <RichTextEditorField
        name='content'
        isDisabled={false}
        isShowToolbar={true}
        value={content}
        onChange={value => {
          setContent(value);
        }}
        className='w-full rounded-10px resize-none'
        label='Content'
        isRequired
      />
      <div className='bg-white flex py-2 px-2 justify-end items-center sticky bottom-[-10px]'>
        <Button
          type='submit'
          variant='filled'
          title='Save'
          className='rounded-lg !px-8 py-2'
          parentClassName='ml-auto'
          isLoading={isPending}
        />
      </div>
    </form>
  );
};

export default DuringSessionNote;
