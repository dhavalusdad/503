import { useForm, useFormContext } from 'react-hook-form';

import { useCreateFieldOptions } from '@/api/field-option';
import { FieldOptionType } from '@/enums';
import type { FormDataEducation } from '@/features/profile/types';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';

type Props = {
  onClose: () => void;
  isOpen: boolean;
};
const AddEducationDegreeModal = (props: Props) => {
  const { onClose, isOpen } = props;
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm({
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
    },
  });

  const { setValue: setParentValue } = useFormContext<FormDataEducation>();

  const { mutate } = useCreateFieldOptions();

  const { invalidate } = useInvalidateQuery();

  const onSubmit = async vals => {
    await mutate(
      {
        data: {
          name: vals.name,
          type: FieldOptionType.DEGREE,
        },
      },
      {
        onSuccess(resData) {
          const { data } = resData;
          setParentValue('degree', { label: data.name, value: data.id });
          invalidate(['degree-options']);
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      title={'Add Degree'}
      isOpen={isOpen}
      onClose={onClose}
      closeButton={false}
      contentClassName='pt-30px'
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            type='button'
            variant='outline'
            title='Cancel'
            isIconFirst
            onClick={onClose}
            className=' rounded-10px !leading-5 !px-30px'
          />
          <Button
            type='button'
            variant='filled'
            title={'Save'}
            onClick={handleSubmit(onSubmit)}
            className=' rounded-10px !leading-5 !px-30px'
            isDisabled={!isDirty}
          />
        </div>
      }
    >
      <InputField
        label='Degree Name'
        name='name'
        register={register}
        error={errors.name?.message}
        type='text'
        placeholder='Enter Name'
        labelClass='!text-base !leading-5'
        inputClass='!text-base !leading-5'
      />
    </Modal>
  );
};

export default AddEducationDegreeModal;
