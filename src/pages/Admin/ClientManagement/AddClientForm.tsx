import { useState, useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetClientManagementDetailsQuery,
  useUpdateClientBasicInfo,
  useDeleteDependent, // Add this import
} from '@/api/clientManagement';
import { useCreateNewPatient } from '@/api/user';
import defaultUserPng from '@/assets/images/default-user.webp';
import { GENDER_OPTION } from '@/constants/CommonConstant';
import { ROUTES } from '@/constants/routePath';
import { getProfileImage } from '@/features/admin/components/appointmentList/components/AppointmentView';
import AddDependent from '@/pages/Admin/ClientManagement/AddDependent';
import { addPatientFormSchema } from '@/pages/Admin/ClientManagement/validation-schema';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import FileUpload from '@/stories/Common/FileUpload';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import Modal from '@/stories/Common/Modal';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select from '@/stories/Common/Select';

type ModalType = {
  fileUpload: boolean;
  deleteProfile: boolean;
  discard: boolean;
  addDependent: boolean;
};

type DependentUser = {
  id: string | number;
  user_id: string;
  dependent_user_id: string | number;
  relationship?: string;
  dependent_user: {
    first_name?: string;
    last_name?: string;
    dob?: string | Date | null;
    phone?: string;
    email?: string;
    gender?: string | { value: string };
  };
  is_active?: boolean;
};

const AddClientForm = () => {
  const params = useParams();
  const { client_id } = params;
  const isEditMode = Boolean(client_id);

  const navigate = useNavigate();

  // ** States **
  const [openModal, setOpenModal] = useState<ModalType>({
    fileUpload: false,
    deleteProfile: false,
    discard: false,
    addDependent: false,
  });

  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // ** Services **
  const {
    mutateAsync: createPatientMutation,
    isPending: isCreatingPatient,
    isError: isErrorCreatingPatient,
  } = useCreateNewPatient({});
  const {
    mutateAsync: updateClientMutation,
    isPending: isUpdatingPatient,
    isError: isErrorUpdatingPatient,
  } = useUpdateClientBasicInfo(client_id!);

  // Add delete dependent mutation
  const { mutateAsync: deleteDependentMutation, isPending: isDeletingDependent } =
    useDeleteDependent();

  // Fetch client data only when in edit mode
  const {
    data: clientData,
    isLoading: isLoadingClientData,
    error: clientDataError,
  } = useGetClientManagementDetailsQuery(client_id!, isEditMode);

  // *** Hook Form ***
  const formValues = useForm({
    resolver: yupResolver(addPatientFormSchema),
    mode: 'all',
    reValidateMode: 'onChange',
    context: { isDependentForm: openModal.addDependent },
  });

  const {
    formState: { isDirty, errors, isValid },
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    setError,
    clearErrors,
    setValue,
    reset,
  } = formValues;

  useEffect(() => {
    if (isEditMode && clientData?.user && !isFormInitialized) {
      const {
        first_name,
        last_name,
        email,
        phone,
        dob,
        gender,
        profile_image,
        dependent_relationships = [],
      } = clientData?.user || {};

      const genderOption = GENDER_OPTION.find(option => option.value === gender);
      const formattedDependents = dependent_relationships?.map((dependent: DependentUser) => {
        const user = dependent?.user;

        const genderValue =
          user?.gender && (typeof user.gender === 'string' ? user.gender : user.gender?.value);

        return {
          id: dependent?.id,
          user_id: dependent?.user_id,
          dependent_user_id: dependent?.dependent_user_id,
          relationship: dependent?.relationship || '',
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          dob: user?.dob ? new Date(user?.dob) : null,
          phone: user?.phone || '',
          email: user?.email || '',
          is_active: dependent?.is_active ?? true,
          isNew: false,
          gender: genderValue
            ? GENDER_OPTION?.find(option => option?.value === genderValue) || null
            : null,
        };
      });

      reset({
        first_name: first_name || '',
        last_name: last_name || '',
        email: email || '',
        phone: phone || '',
        dob: dob ? new Date(dob) : null,
        gender: genderOption || undefined,
        profile_image: profile_image || null,
        dependents: formattedDependents || [],
      });

      if (dependent_relationships && dependent_relationships.length > 0) {
        setOpenModal(prev => ({ ...prev, addDependent: true }));
      }

      setIsFormInitialized(true);
    }
  }, [clientData, isEditMode, isFormInitialized, reset]);

  if (isEditMode && (isLoadingClientData || !isFormInitialized)) {
    return <SectionLoader />;
  }

  if (isEditMode && clientDataError) {
    return (
      <div className='bg-white rounded-20px border border-solid border-surface p-5'>
        <div className='text-center py-10'>
          <p className='text-red-500 text-lg'>Failed to load client data. Please try again.</p>
          <Button
            variant='filled'
            title='Go Back'
            className='mt-4'
            onClick={() => navigate(ROUTES.CLIENT_MANAGEMENT.path)}
          />
        </div>
      </div>
    );
  }

  const navigateToListingPage = () => navigate(ROUTES.CLIENT_MANAGEMENT.path);

  const openCloseModal = (modalName: keyof ModalType, actionBool: boolean = false) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
    }));
  };

  // Handler for deleting dependent
  const handleDeleteDependent = async (dependentId: string | number) => {
    try {
      await deleteDependentMutation(dependentId);
      // Optionally show success message
    } catch (error) {
      console.error('Error deleting dependent:', error);
      throw error; // Re-throw to let AddDependent handle it
    }
  };

  const onSubmit = handleSubmit(async () => {
    if (!isValid) return;
    const vals = getValues();
    const { first_name, last_name, dob, email, gender, dependents, phone, profile_image } = vals;

    const formData = new FormData();
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('dob', dob ? new Date(dob).toISOString() : '');
    formData.append('gender', gender?.value || '');
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('tenant_id', clientData?.tenant_id);
    if (profile_image && profile_image instanceof File) {
      formData.append('profile_image', profile_image);
    } else if (profile_image && typeof profile_image === 'string') {
      formData.append('profile_image', profile_image);
    } else {
      formData.append('profile_image', '');
    }

    formData.append(
      'dependents',
      JSON.stringify(
        dependents?.map(item => ({
          ...item,
          gender: item.gender ? item.gender.value : null,
          dob: item.dob ? new Date(item.dob).toISOString() : null,
        })) || []
      )
    );

    try {
      if (isEditMode) {
        await updateClientMutation(formData);
      } else {
        await createPatientMutation(formData);
        navigateToListingPage();
      }
      if (!isErrorCreatingPatient || !isErrorUpdatingPatient) {
        navigate(ROUTES.CLIENT_MANAGEMENT.path);
      }
    } catch (error) {
      console.error('Error saving client:', error);
    }
  });

  const onCancelDiscardModal = () => {
    navigateToListingPage();
  };

  const isSubmitting = isCreatingPatient || isUpdatingPatient;
  const submitButtonTitle = isEditMode ? 'Update' : 'Save Changes';
  const formTitle = isEditMode ? 'Edit Client' : 'Add Client';

  const getImageSource = (profileImage: File | string | null | undefined) => {
    if (!profileImage) return null;

    // If it's a File object (newly uploaded), create a temporary URL
    if (profileImage instanceof File) {
      return URL.createObjectURL(profileImage);
    }

    // If it's a string (existing image path from backend), use getProfileImage
    if (typeof profileImage === 'string') {
      return getProfileImage(profileImage);
    }

    return null;
  };

  return (
    <>
      <div className='bg-white rounded-20px border border-solid border-surface p-5'>
        <div className='flex flex-col gap-5 mb-5'>
          <h2 className='text-xl font-bold text-blackdark'>{formTitle}</h2>
          <h3 className='text-lg font-bold text-blackdark leading-6'>Profile Picture</h3>
          <div className='flex sm:flex-row flex-col items-center gap-5 border border-solid rounded-2xl p-3.5 border-Gray'>
            <Image
              imgPath={
                watch('profile_image')
                  ? getImageSource(watch('profile_image'))
                  : watch('first_name') && watch('last_name')
                    ? ''
                    : defaultUserPng
              }
              firstName={getValues('first_name')}
              lastName={getValues('last_name')}
              alt='Profile'
              imageClassName='rounded-full object-cover object-center w-full h-full'
              className='w-84px text-base h-84px bg-surface rounded-full overflow-hidden flex items-center justify-center'
              initialClassName='!text-base'
            />
            <div className='flex flex-col gap-1.5'>
              <p className='text-base font-normal leading-22px text-blackdark'>Profile Image</p>
              <Button
                variant='filled'
                title='Upload Image'
                className=' !py-1.5 rounded-md'
                type='button'
                onClick={() => openCloseModal('fileUpload', true)}
              />
              <p className='text-sm font-normal leading-18px text-primarygray'>
                Your image should be below 2 MB, accepted formats: jpg, png.
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-5'>
          <h3 className='text-lg font-bold text-blackdark leading-6'>Information</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-25px gap-y-5'>
            <InputField
              type='text'
              label='First Name'
              labelClass='!text-base'
              placeholder='Enter first name'
              register={register}
              name='first_name'
              error={errors.first_name?.message}
              inputClass='!text-base !leading-5'
              isRequired
            />
            <InputField
              type='text'
              label='Last Name'
              labelClass='!text-base'
              placeholder='Enter last name'
              register={register}
              name='last_name'
              error={errors.last_name?.message}
              inputClass='!text-base !leading-5'
              isRequired
            />
            <InputField
              type='email'
              label='Email Address'
              labelClass='!text-base'
              placeholder='Enter email address'
              register={register}
              name='email'
              error={errors.email?.message}
              inputClass='!text-base !leading-5'
              isDisabled={isEditMode}
              isRequired
            />

            <div className='flex'>
              <PhoneField
                control={control}
                name='phone'
                label={'Contact Number'}
                labelClass='!text-base'
                isRequired={true}
                parentClassName='w-full border-primarylight'
                inputClass='!text-base !leading-5'
                country='us'
                enableSearch={true}
                error={errors.phone && errors.phone.message}
                isReadOnly={false}
                isModal={false}
              />
            </div>
            <div className='profile-datepicker'>
              <Controller
                name='dob'
                control={control}
                rules={{
                  required: false,
                }}
                render={({ field, fieldState }) => (
                  <CustomDatePicker
                    label='Date of Birth'
                    labelClass='!text-base'
                    placeholderText='Select date of birth'
                    error={fieldState.error?.message}
                    selected={field.value}
                    onChange={date => field.onChange(date ? new Date(date) : null)}
                    maxDate={new Date()}
                    maxAge={130}
                    isRequired
                  />
                )}
              />
            </div>
            <Select
              label='Gender'
              options={GENDER_OPTION}
              control={control}
              name='gender'
              placeholder='Select gender'
              error={errors.gender?.message}
              StylesConfig={{
                control: () => ({
                  minHeight: '50px',
                }),
                singleValue: () => ({
                  fontSize: '16px',
                }),
                option: () => ({
                  fontSize: '16px',
                }),
              }}
              labelClassName='!text-base'
              isRequired
            />
          </div>
        </div>
        {openModal.addDependent && (
          <div className='pt-30px border-t border-solid border-surface mt-30px flex flex-col gap-5'>
            <h3 className='text-lg font-bold text-blackdark leading-6'>Dependent Form</h3>
            <FormProvider {...formValues}>
              <AddDependent
                isEdit={isEditMode}
                onDeleteDependent={handleDeleteDependent}
                isDeletingDependent={isDeletingDependent}
              />
            </FormProvider>
          </div>
        )}

        <div className='pt-30px mt-5 border-t border-solid border-surface flex flex-wrap items-center gap-4'>
          {!openModal.addDependent && (
            <div>
              <Button
                variant='filled'
                title='Add Dependent'
                icon={<Icon name='plus' />}
                isIconFirst
                className='rounded-lg'
                onClick={() => openCloseModal('addDependent', true)}
              />
            </div>
          )}
          <div className='flex flex-wrap gap-5 justify-end ml-auto '>
            <Button
              variant='outline'
              title='Cancel'
              className='!px-6 rounded-10px min-h-50px'
              type='button'
              onClick={() => {
                if (isDirty) {
                  openCloseModal('discard', true);
                } else {
                  navigateToListingPage();
                }
              }}
            />
            <Button
              variant='filled'
              title={submitButtonTitle}
              className='!px-6 rounded-10px min-h-50px'
              type='button'
              onClick={onSubmit}
              isLoading={isSubmitting}
              isDisabled={!isDirty}
            />
          </div>
        </div>
      </div>
      {openModal.discard && (
        <AlertModal
          isOpen={openModal.discard}
          onClose={() => openCloseModal('discard', false)}
          onSubmit={onCancelDiscardModal}
          alertMessage='If you cancel, your changes will be lost. Are you sure you want to proceed?'
          title='Confirm Discard'
        />
      )}
      {openModal.fileUpload && (
        <Modal
          isOpen={openModal.fileUpload}
          onClose={() => {
            clearErrors('profile_image');
            openCloseModal('fileUpload', false);
          }}
          title='Upload Profile Image'
          size='sm'
        >
          <>
            <FileUpload
              multiple={false}
              handelSubmit={files => {
                const selectedFile = files[0]?.file;
                const sizeMB = selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2);
                if (Number(sizeMB) >= 2) {
                  setError('profile_image', {
                    message: 'Your image size should be below 2 MB',
                  });
                } else {
                  clearErrors('profile_image');
                  if (selectedFile) {
                    setValue('profile_image', selectedFile, { shouldDirty: true });
                  }
                  openCloseModal('fileUpload', false);
                }
              }}
              accept={'image/*'}
              className={''}
              NumberOfFileAllowed={2}
              onFileRemove={() => clearErrors('profile_image')}
            />
            <p className='text-red'>{errors.profile_image?.message}</p>
          </>
        </Modal>
      )}
    </>
  );
};

export default AddClientForm;
