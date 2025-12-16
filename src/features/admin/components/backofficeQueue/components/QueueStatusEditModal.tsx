import { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { useUpdateQueueRequest } from '@/api/queueManagement';
import { UpdateQueueRequestDataType } from '@/features/admin/components/backofficeQueue/constant';
import { AuditTrialSchema } from '@/features/admin/components/backofficeQueue/types';
import { formatStatusLabel } from '@/helper';
import Button from '@/stories/Common/Button';
import FileUpload from '@/stories/Common/FileUpload';
import Modal from '@/stories/Common/Modal';
import TextArea from '@/stories/Common/Textarea';

interface QueueEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueId: string;
  status: string;
}

interface FormData {
  comment: string;
  docs: string[] | File[] | null;
  status: string;
}

const QueueStatusEditModal = ({ isOpen, onClose, queueId, status }: QueueEditModalProps) => {
  const { mutate: updateQueue } = useUpdateQueueRequest();
  const {
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      comment: '',
      docs: null,
    },
    mode: 'onChange',
    resolver: yupResolver(AuditTrialSchema),
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string>('');

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();

      formData.append('status', status);
      formData.append('comment', data.comment ?? '');
      formData.append('queue_id', queueId);
      formData.append('type', UpdateQueueRequestDataType.STATUS);

      uploadedFiles.forEach(file => formData.append('audit_trail', file));

      await updateQueue({ data: formData, id: queueId });
    } catch (error) {
      console.error('Error updating queue:', error);
    } finally {
      onClose();
    }
  };

  const onSkip = async () => {
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('queue_id', queueId);
      formData.append('type', UpdateQueueRequestDataType.STATUS);

      await updateQueue({ data: formData, id: queueId });
    } catch (err) {
      console.error('Error skipping update:', err);
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id='appointment-edit-modal'
      title={`${formatStatusLabel(status)} Request`}
      size='sm'
      contentClassName='pt-30px'
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            type='button'
            variant='outline'
            title='Skip'
            isIconFirst
            onClick={onSkip}
            className='rounded-10px !leading-5 !px-6'
          />
          <Button
            variant='filled'
            title='Save'
            isDisabled={(uploadedFiles.length === 0 && !isDirty) || imageError !== ''}
            onClick={handleSubmit(onSubmit)}
            className='rounded-10px !leading-5 !px-6'
          />
        </div>
      }
    >
      <div className='flex flex-col gap-5'>
        <TextArea
          name='comment'
          rows={4}
          placeholder='Enter description (max 500 characters)'
          onChange={e =>
            setValue('comment', e.target.value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          error={errors.comment?.message}
        />

        <div className='flex flex-col gap-2.5'>
          <FileUpload
            multiple={true}
            NumberOfFileAllowed={5} // allow up to 5 (or remove limit)
            accept='image/*'
            className='w-full'
            autoUpload={true}
            handelSubmit={files => {
              const validFiles: File[] = [];
              if (files.length > 5) {
                setImageError(`File limit exceeded: More than 5 items not accepted.`);
              }

              files.forEach(fileObj => {
                const selectedFile = fileObj.file;
                if (!selectedFile) return;

                const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
                const allowedTypes = ['image/jpg', 'image/png', 'image/jpeg'];

                if (Number(sizeMB) >= 2) {
                  setImageError(`${selectedFile.name} is too large (>= 2MB).`);
                  return;
                } else if (!allowedTypes.includes(selectedFile.type)) {
                  setImageError(`${selectedFile.name} has unsupported format.`);
                  return;
                } else {
                  setImageError('');
                }
                if (files.length > 5) {
                  setImageError(`File limit exceeded: More than 5 items not accepted.`);
                }

                validFiles.push(selectedFile);
              });

              // append instead of replace
              setUploadedFiles([...validFiles]);
            }}
          />
          {imageError && <p className='text-red text-xs'>{imageError}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default QueueStatusEditModal;
