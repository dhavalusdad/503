import { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { useCreateAgreement, useGetAgreementById, useUpdateAgreementById } from '@/api/agreement';
import { showToast } from '@/helper';
import Button from '@/stories/Common/Button';
import FileUpload from '@/stories/Common/FileUpload';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import RichTextEditorField from '@/stories/Common/RichTextEditer';
import Switch from '@/stories/Common/Switch';

// Validation schema for the agreement form
const agreementSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  file: yup
    .mixed()
    .nullable()
    .test('fileType', 'Only PDF and DOC files are allowed', value => {
      if (!value || !value[0]) return true; // Allow empty files
      const file = value[0] as File;
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      return allowedTypes.includes(file.type);
    })
    .test('fileSize', 'File size should be less than 10MB', value => {
      if (!value || !value[0]) return true;
      const file = value[0] as File;
      return file.size <= 10 * 1024 * 1024; // 10MB limit
    }),
});

interface AddEditAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  id?: string;
}

const INITIAL_VALUES = {
  title: '',
  description: '',
  isPublished: false,
  file: null,
  doc_path: null,
};

const AddEditAgreementModal = ({
  isOpen,
  onClose,
  isEdit = false,
  id,
}: AddEditAgreementModalProps) => {
  const { mutate: createAgreement } = useCreateAgreement();
  const { data: agreement, dataUpdatedAt } = useGetAgreementById(id as string);
  const { mutate: updateAgreement } = useUpdateAgreementById();
  const [isNewPdfUploaded, setIsNewPdfUploaded] = useState<boolean>(false);

  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      file: null,
    },
    mode: 'onChange',
    resolver: yupResolver(agreementSchema),
  });

  const [initialValues, setInitialValues] = useState(INITIAL_VALUES);

  const watchValues = watch();
  const { title: watchedTitle } = watchValues;

  useEffect(() => {
    if (isOpen) {
      if (isEdit && agreement) {
        const initTitle = agreement?.title || '';
        const initDesc = agreement?.description || '';
        const initPublished = agreement?.is_published || false;
        const initDoc = agreement?.doc || false;
        const InitDocPath = agreement?.doc_path;

        reset({
          title: initTitle,
          file: null,
          description: initDesc,
        });
        setDescription(initDesc);
        setIsPublished(initPublished);
        setSelectedFile(initDoc as File);
        setInitialValues({
          title: initTitle,
          description: initDesc,
          isPublished: initPublished,
          file: initDoc,
          doc_path: InitDocPath,
        });
      } else {
        setInitialValues(INITIAL_VALUES);

        reset(INITIAL_VALUES);
        setDescription('');
        setIsPublished(false);
        setSelectedFile(null);
      }
    }
  }, [isOpen, isEdit, dataUpdatedAt, reset, agreement]);

  const getPlainText = (html: string) => {
    return html
      ?.replace(/<[^>]+>/g, ' ') // remove HTML tags
      ?.replace(/(&nbsp;|\s)+$/g, '') // remove only trailing spaces or &nbsp;
      ?.trimEnd(); // extra safety for trailing whitespace
  };

  const isFormChanged = useMemo(() => {
    let isChanged =
      (watchedTitle || '').trim() !== (initialValues.title || '').trim() ||
      getPlainText(description) !== getPlainText(initialValues.description) ||
      isPublished !== initialValues.isPublished;
    if (isEdit) {
      isChanged =
        isChanged ||
        (initialValues.file
          ? !selectedFile || (!!selectedFile && selectedFile instanceof File)
          : !!selectedFile && selectedFile instanceof File);
    } else {
      isChanged = isChanged || (!!selectedFile && selectedFile instanceof File);
    }
    return isChanged;
  }, [watchedTitle, description, selectedFile, isPublished]);

  const handleClose = () => {
    reset();
    setDescription('');
    setIsPublished(false);
    setSelectedFile(null);
    onClose();
  };

  const handleFileSelect = (file: File | null) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file?.type || '')) {
      setError('file', { message: 'Only PDF and DOC files are allowed' });
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      setError('file', { message: 'File size should be less than 10MB' });
      return;
    }

    clearErrors('file');
    setSelectedFile(file);
    setValue('file', file);
  };

  // const removeFile = () => {
  //   setSelectedFile(null);
  //   setValue('file', null);
  //   clearErrors('file');
  // };

  // const getFileIcon = (fileName: string) => {
  //   const extension = fileName.split('.').pop()?.toLowerCase();
  //   if (extension === 'pdf') return '📄';
  //   if (extension === 'doc' || extension === 'docx') return '📝';
  //   return '📄';
  // };

  const onSubmit = async (data: { title: string; file: FileList | null }) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', description);
      formData.append('is_published', isPublished.toString());

      if (isEdit) {
        if (selectedFile && isNewPdfUploaded) {
          formData.append('agreement', selectedFile);
        }
        await updateAgreement({
          id: id || '',
          data: formData,
        });
      } else {
        if (selectedFile) {
          formData.append('agreement', selectedFile);
        }
        await createAgreement({
          data: formData,
        });
      }

      handleClose();
    } catch (error) {
      console.error(error);
      showToast('Failed to save Agreement', 'ERROR');
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Agreement' : 'Add Agreement'}
      isOpen={isOpen}
      onClose={handleClose}
      size='xl'
      closeButton={false}
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            type='button'
            variant='outline'
            title='Cancel'
            onClick={handleClose}
            className='!px-6 rounded-10px'
          />
          <Button
            type='button'
            variant='filled'
            title={isEdit ? 'Update' : 'Save'}
            onClick={handleSubmit(onSubmit)}
            className='!px-6 rounded-10px'
            isDisabled={!isFormChanged}
          />
        </div>
      }
    >
      <div className='flex flex-col gap-5'>
        {/* Title Input */}
        <InputField
          label='Title'
          name='title'
          register={register}
          error={errors.title?.message}
          type='text'
          placeholder='Enter Agreement Title'
          isRequired={true}
          labelClass='!text-base'
          inputClass='!text-base !leading-5'
        />

        {/* File Upload */}
        <div className='flex flex-col gap-1.5'>
          <FileUpload
            label='Upload File'
            labelNote='Only PDF and DOC files are allowed (Max 10MB)'
            multiple={false}
            noLimit={false}
            NumberOfFileAllowed={1}
            accept={'.pdf,.doc,.docx'}
            className={'w-full col-span-2'}
            canRemoveExisting={true}
            autoUpload={true}
            {
              ...(isEdit && initialValues?.file
                ? {
                    existingFiles: [
                      {
                        id: '123',
                        name: initialValues?.file?.name || 'document.pdf',
                        url: initialValues?.doc_path || '',
                        type: 'application/pdf',
                        isExisting: true,
                        size: initialValues?.file?.size,
                      },
                    ],
                  }
                : {}) // 👈 return empty object instead of false
            }
            handelSubmit={files => {
              const selectedFile = files[0]?.file;
              handleFileSelect(selectedFile as File);
            }}
            onFileRemove={() => {
              clearErrors('file');
              setInitialValues(prev => ({
                ...prev,
                file: null,
              }));
              if (isEdit) {
                setIsNewPdfUploaded(true);
              }
            }}
          />
          {errors.file && <p className='text-red-500 text-xs'>{errors.file.message}</p>}
        </div>

        {/* Description with RichTextEditorField */}
        <RichTextEditorField
          name='description'
          value={description}
          label='Description'
          placeholder='Enter agreement description...'
          onChange={content => {
            setDescription(content);
            if (content.trim()) {
              setValue('description', content, { shouldValidate: true });
            }
          }}
          isRequired
          error={errors.description?.message}
        />

        {/* Published Toggle */}
        {/* Published Toggle */}
        <div className='flex items-center justify-between p-5 bg-Gray rounded-10px'>
          <div className='flex flex-col gap-2.5'>
            <h4 className='text-base font-medium text-blackdark leading-5'>Publication Status</h4>
            <p className='text-sm text-blackdark font-normal leading-18px'>
              {isPublished
                ? 'This agreement is published and visible to users'
                : 'This agreement is unpublished and hidden from users'}
            </p>
          </div>
          {/* Toggle Wrapper */}
          <Switch
            isChecked={isPublished}
            onChange={() => {
              setIsPublished(!isPublished);
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddEditAgreementModal;
