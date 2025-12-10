import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { differenceInYears } from 'date-fns';
import moment, { type Moment } from 'moment';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { useGetCitiesByState } from '@/api/city';
import {
  useGetCountries,
  useGetStateByCountry,
  useGetUserProfile,
  useUpdateClientProfile,
} from '@/api/user';
import defaultUserImage from '@/assets/images/default-user.webp';
import { GENDER_OPTION, MARTIAL_STATUS_OPTION, TIMEZONE_OPTIONS } from '@/constants/CommonConstant';
import type { ClientProfileFormData } from '@/features/client/types';
import { dispatchSetUser } from '@/redux/dispatch/user.dispatch';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import FileUpload from '@/stories/Common/FileUpload';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import Modal from '@/stories/Common/Modal';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select from '@/stories/Common/Select';
import TextArea from '@/stories/Common/Textarea';

import { clientProfileValidationSchema } from '../../validationSchema/profileValidation.ts';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

export const ClientProfileComponent = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<{
    imageModal: boolean;
    deleteImageModal: boolean;
    cancelModal: boolean;
    saveModal: boolean;
  }>({
    imageModal: false,
    deleteImageModal: false,
    cancelModal: false,
    saveModal: false,
  });

  const user = useSelector(currentUser);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    trigger,
    setError,
    clearErrors,
    watch,
    formState: { errors, isDirty },
    control,
  } = useForm<ClientProfileFormData>({
    resolver: yupResolver(clientProfileValidationSchema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const selectedState = watch('state');
  const selectedCountry = watch('country');

  const { data: userData, isPending, dataUpdatedAt } = useGetUserProfile();
  const { data: allCountries, isPending: loading } = useGetCountries();
  const { mutateAsync: updateClientProfile, isPending: isSaving } = useUpdateClientProfile();
  const { data: allStatesResponse } = useGetStateByCountry({
    country_id: selectedCountry?.value as string,
  });
  const { data: citiesData } = useGetCitiesByState((selectedState?.value as string) || '', {
    options: { enabled: !!selectedState },
    isCredentialed: true,
  });

  useEffect(() => {
    if (!isPending && userData) {
      const updateReduxData = {
        timezone: userData?.user_settings[0]?.timezone as string,
        profile_image: userData?.profile_image as string,
        phone: userData?.phone as string,
        updated_at: userData?.updated_at as string,
        first_name: userData?.first_name as string,
        last_name: userData?.last_name as string,
        created_at: userData?.created_at as string,
      };
      dispatchSetUser({ ...user, ...updateReduxData });
    }
  }, [dataUpdatedAt]);

  useEffect(() => {
    if (userData) {
      const userProfileData: ClientProfileFormData = {
        profile_image: userData?.profile_image,
        first_name: userData.first_name,
        last_name: userData.last_name,
        dob: moment(userData?.dob),
        gender: userData?.gender,
        email: userData.email,
        marital_status: userData?.marital_status,
        phone: userData?.phone,
        address: userData?.address,
        city: userData?.user_city
          ? { value: userData?.user_city?.id, label: userData?.user_city?.name }
          : null,
        state: userData.user_state
          ? {
              value: userData.user_state?.id,
              label: userData.user_state?.name,
              country_id: userData.user_state.country_id,
            }
          : null,
        country: userData.user_country
          ? { value: userData.user_country?.id, label: userData.user_country?.name }
          : null,
        postal_code: userData?.postal_code,
        allergies: userData.user_client?.allergies,
        emergency_contact: userData.user_client?.emergency_contact,
        timezone: userData?.user_settings[0]?.timezone,
      };

      if (userData.profile_image) {
        setProfileImage(`${SERVER_URL}${userData.profile_image}`);
      }
      reset(userProfileData);
    }
  }, [userData, reset]);

  useEffect(() => {
    trigger('profile_image');
  }, [profileImage]);

  const calculateAge = (birth_date: Moment | null): string => {
    if (!birth_date || !birth_date.isValid()) return '';
    return String(differenceInYears(new Date(), birth_date.toDate()));
  };

  const handleUploadFile = (image: File) => {
    const img = URL.createObjectURL(image);
    setProfileImage(img);
    setValue('profile_image', image, { shouldDirty: true });
    toggleModal('imageModal', false);
  };

  const onDeleteProfilePic = () => {
    setProfileImage(null);
    setValue('profile_image', null, { shouldDirty: true });
    toggleModal('deleteImageModal', false);
  };

  const handleDiscardChanges = () => {
    reset();
    toggleModal('cancelModal', false);
    setIsEditing(false);
  };

  const toggleModal = (modalName: keyof typeof openModal, isOpen: boolean = false) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: isOpen,
    }));
  };

  const onFormSubmit: SubmitHandler<ClientProfileFormData> = async (
    data: ClientProfileFormData
  ) => {
    try {
      const formData = new FormData();
      if (profileImage === null && data.profile_image === null) {
        formData.append('delete_image', 'true');
      } else if (data.profile_image instanceof File) {
        formData.append('profile_image', data.profile_image);
      } else {
        formData.append('profile_image', data.profile_image as string);
      }

      const fields: (keyof ClientProfileFormData)[] = [
        'first_name',
        'last_name',
        // "email",
        'dob',
        'gender',
        'marital_status',
        'phone',
        'address',
        'city',
        'country',
        'state',
        'postal_code',
        'allergies',
        'emergency_contact',
        'timezone',
      ];

      fields.forEach(field => {
        const value = data[field];

        if (field === 'dob' && value instanceof Date) {
          formData.append('dob', moment(data.dob).format('YYYY-MM-DD'));
          return;
        }

        if (['country', 'state', 'city'].includes(field)) {
          formData.append(field, value.value);
          return;
        }

        if (value !== undefined && value !== null) {
          formData.append(field, String(value));
        }
      });
      await updateClientProfile({ data: formData });

      toggleModal('saveModal', false);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveChanges = () => {
    handleSubmit(onFormSubmit)();
  };

  if (isPending || loading) {
    return <SectionLoader />;
  }

  return (
    <>
      <div>
        <div className='border border-solid border-surface rounded-20px p-5 bg-white'>
          {/* Profile image section */}
          <div className='flex flex-wrap gap-3 justify-between items-start'>
            <div className='flex flex-col gap-5'>
              <h3 className='text-lg font-bold text-blackdark leading-6'>Profile Picture</h3>
              <div className='flex items-center gap-5'>
                <Image
                  imgPath={
                    profileImage
                      ? profileImage
                      : watch('first_name') && watch('last_name')
                        ? ''
                        : defaultUserImage
                  }
                  firstName={getValues('first_name')}
                  lastName={getValues('last_name')}
                  alt='Profile image'
                  imageClassName='rounded-full object-cover object-center w-full h-full'
                  className='md:w-[108px] md:min-w-[108px] min-w-[70px] md:h-[108px] w-[70px] h-[70px] bg-surface rounded-full overflow-hidden flex items-center justify-center aspect-square'
                />
                {isEditing && (
                  <div className='flex items-center gap-5'>
                    <Button
                      title='Upload Image'
                      variant='filled'
                      onClick={() => toggleModal('imageModal', true)}
                      className='!py-2.5 rounded-lg min-h-50px'
                      icon={<Icon name='upload' />}
                      isIconFirst
                    />
                    {profileImage && (
                      <Button
                        title='Delete'
                        variant='none'
                        onClick={() => toggleModal('deleteImageModal', true)}
                        className='!p-0 rounded-none text-red !font-medium'
                        parentClassName='leading-4'
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            {!isEditing && (
              <div>
                <Button
                  title='Edit Profile'
                  variant='filled'
                  onClick={() => setIsEditing(true)}
                  className='!py-2 rounded-lg'
                >
                  <Icon name='edit' />
                </Button>
              </div>
            )}
          </div>
          <div className='w-full h-1px bg-surface my-30px'></div>
          <div className='relative'>
            <h6 className='text-lg font-bold leading-6 text-blackdark mb-5'>Client Information</h6>
            <div className='grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-25px gap-y-5'>
              <InputField
                type='text'
                label='First Name'
                labelClass='!text-base !leading-22px'
                name='first_name'
                register={register}
                error={errors.first_name?.message}
                isDisabled={!isEditing}
                isRequired={true}
                parentClassName=''
                placeholder='First Name'
                inputClass={'!text-base !leading-22px !text-primarygray !px-3.5 !py-3 bg-Gray'}
              />
              <InputField
                type='text'
                label='Last Name'
                labelClass='!text-base !leading-22px'
                register={register}
                name='last_name'
                error={errors.last_name?.message}
                isDisabled={!isEditing}
                isRequired={true}
                parentClassName=''
                placeholder='Last Name'
                inputClass={'!text-base !leading-22px !text-primarygray !px-3.5 !py-3 bg-Gray'}
              />
              <CustomDatePicker
                label='Date of Birth'
                labelClass='!text-base !leading-22px'
                name='dob'
                selected={
                  getValues('dob') && moment(getValues('dob')).isValid()
                    ? moment(getValues('dob')).toDate()
                    : ''
                }
                onChange={date =>
                  setValue('dob', moment(date), { shouldValidate: true, shouldDirty: true })
                }
                error={errors.dob?.message}
                maxDate={new Date()}
                disabled={!isEditing}
                isRequired={true}
                parentClassName='z-[0]'
                className='client-profile'
              />
              <Select
                options={GENDER_OPTION}
                isRequired={true}
                label='Gender'
                name='gender'
                labelClassName='!text-base !leading-22px'
                value={GENDER_OPTION.find(option => option.value === getValues('gender'))}
                placeholder='Select Gender'
                onChange={value => {
                  if (value && 'value' in value) {
                    setValue('gender', value.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                error={errors.gender?.message}
                isDisabled={!isEditing}
                parentClassName=''
                StylesConfig={{
                  control: () => ({
                    minHeight: '48px',
                    background: '#F6F5F4',
                    backgroundColor: '#E8ECF3',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                  placeholder: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                }}
              />
              <InputField
                label='Age'
                type='text'
                labelClass='!text-base !leading-22px'
                value={calculateAge(getValues('dob'))}
                isDisabled={true}
                isRequired={true}
                parentClassName=''
                placeholder='Age'
                inputClass={'!text-base !leading-22px !text-primarygray !px-3.5 !py-3 bg-Gray'}
              />
              <Select
                options={MARTIAL_STATUS_OPTION}
                isRequired={true}
                label='Marital Status'
                name='marital_status'
                labelClassName='!text-base !leading-22px'
                value={MARTIAL_STATUS_OPTION.find(
                  option => option.value === getValues('marital_status')
                )}
                placeholder='Marital Status'
                onChange={value => {
                  if (value && 'value' in value) {
                    setValue('marital_status', value.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                error={errors.marital_status?.message}
                isDisabled={!isEditing}
                parentClassName=''
                StylesConfig={{
                  control: () => ({
                    minHeight: '48px',
                    background: '#F6F5F4',
                    backgroundColor: '#E8ECF3',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                  placeholder: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                }}
              />
              <InputField
                type='email'
                label='Email'
                labelClass='!text-base !leading-22px'
                register={register}
                name='email'
                error={errors.email?.message}
                isDisabled={true}
                isRequired={true}
                parentClassName=''
                placeholder='Email'
                inputClass={'!text-base !leading-22px !text-primarygray !px-3.5 !py-3 bg-Gray'}
              />
              <PhoneField
                label='Contact Number'
                labelClass='!text-base !leading-22px'
                value={getValues('phone') || ''}
                name='phone'
                onChange={formattedValue => {
                  setValue('phone', formattedValue, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                isRequired={true}
                error={errors.phone?.message}
                disabled={!isEditing}
                placeholder='Contact number'
                parentClassName='client-profile'
                inputClass={` !text-base !leading-6 !p-3 !bg-Gray ${errors.phone && errors.phone.message ? 'border-red-500' : ''} `}
                buttonClass='!bg-Gray'
              />
              <PhoneField
                label='Emergency Contact Number'
                labelClass='!text-base !leading-22px'
                value={getValues('emergency_contact') || ''}
                name='emergency_contact'
                onChange={formattedValue => {
                  setValue('emergency_contact', formattedValue, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                error={errors.emergency_contact?.message}
                disabled={!isEditing}
                placeholder='Emergency contact number'
                parentClassName='client-profile'
                inputClass={` !text-base !leading-6 !p-3 !bg-Gray ${errors.emergency_contact && errors.emergency_contact.message ? 'border-red-500' : ''} `}
                buttonClass='!bg-Gray'
              />
              <InputField
                type='string'
                label='Address'
                labelClass='!text-base !leading-22px'
                register={register}
                name='address'
                error={errors.address?.message}
                isDisabled={!isEditing}
                isRequired={true}
                parentClassName='xl:col-span-3 md:col-span-2 col-span-1'
                placeholder='Address'
                inputClass={'!text-base !leading-22px !text-primarygray !px-3.5 !py-3 bg-Gray'}
              />
              <Select
                options={TIMEZONE_OPTIONS}
                name='timezone'
                value={TIMEZONE_OPTIONS.find(option => option.value === getValues('timezone'))}
                onChange={value => {
                  if (value && 'value' in value) {
                    setValue('timezone', value.value, { shouldValidate: true, shouldDirty: true });
                  }
                }}
                error={errors.timezone?.message}
                label='Time Zone'
                labelClassName='!text-base !leading-22px'
                isMulti={false}
                isDisabled={!isEditing}
                parentClassName=''
                StylesConfig={{
                  control: () => ({
                    minHeight: '48px',
                    background: '#F6F5F4',
                    backgroundColor: '#E8ECF3',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                  placeholder: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                }}
              />
              <Select
                options={allCountries?.filter(
                  (option: { value: string; label: string }) => option.label === 'United States'
                )}
                isRequired
                label='Country'
                name='country'
                labelClassName='!text-base !leading-22px'
                control={control}
                placeholder='Select Country'
                onChange={(selected: { value: string }) => {
                  const country_id = selected?.value;
                  if ((country_id && getValues('state')?.country_id !== country_id) || !selected) {
                    setValue('state', null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setValue('city', null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                error={errors.country?.message}
                isDisabled={!isEditing}
                parentClassName=''
                StylesConfig={{
                  control: () => ({
                    minHeight: '48px',
                    background: '#F6F5F4',
                    backgroundColor: '#E8ECF3',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                  placeholder: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                }}
              />

              <Select
                options={
                  allStatesResponse?.length
                    ? allStatesResponse.map(s => ({
                        label: s.label,
                        value: s.value,
                        country_id: s.country_id,
                      }))
                    : [{ value: '', label: 'No states for selected country' }]
                }
                label='State'
                labelClassName='!text-base !leading-22px'
                name='state'
                control={control}
                placeholder='Select State'
                isRequired
                onChange={(selected: { value: string }) => {
                  if (!selected.value) {
                    setValue('state', null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                  setValue('city', null, {
                    shouldDirty: true,
                  });
                }}
                error={errors.state?.message}
                isDisabled={!isEditing || !getValues('country')?.value}
                parentClassName=''
                StylesConfig={{
                  control: () => ({
                    minHeight: '48px',
                    background: '#F6F5F4',
                    backgroundColor: '#E8ECF3',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                  placeholder: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                }}
              />
              <Select
                options={
                  citiesData?.length
                    ? citiesData
                    : [{ value: '', label: 'No cities for selected state' }]
                }
                label='City'
                labelClassName='!text-base !leading-22px'
                name='city'
                control={control}
                placeholder='Select City'
                isRequired={true}
                onChange={(selected: { value: string }) => {
                  if (!selected?.value) {
                    setValue('city', null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                error={errors.city?.message}
                isDisabled={!isEditing || !selectedState}
                parentClassName=''
                StylesConfig={{
                  control: () => ({
                    minHeight: '48px',
                    background: '#F6F5F4',
                    backgroundColor: '#E8ECF3',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                  placeholder: () => ({
                    fontSize: '16px',
                    lineHeight: '22px',
                  }),
                }}
              />

              <InputField
                type='string'
                label='Postal Code'
                labelClass='!text-base !leading-22px'
                register={register}
                name='postal_code'
                error={errors.postal_code?.message}
                isDisabled={!isEditing}
                isRequired={true}
                parentClassName=''
                placeholder='Postal code'
                inputClass={'!text-base !leading-22px !text-primarygray !px-3.5 !py-3 bg-Gray'}
              />
              <TextArea
                label='Allergies'
                name='allergies'
                error={errors.allergies?.message}
                placeholder='Describe your allergies...'
                labelClass='!text-base !leading-22px'
                className='!text-base !leading-6 !p-3 bg-Gray'
                parentClassName='xl:col-span-3 md:col-span-2 col-span-1'
                isDisabled={!isEditing}
                rows={3}
                onChange={e => {
                  setValue('allergies', e.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                value={getValues('allergies')}
              />
            </div>
          </div>

          {isEditing && (
            <div className='flex items-center justify-end gap-5 mt-5'>
              <Button
                title='Cancel'
                variant='outline'
                onClick={() => toggleModal('cancelModal', true)}
                className='px-3 py-3 rounded-lg'
              />
              <Button
                title='Save Changes'
                variant='filled'
                onClick={async () => {
                  const valid = await trigger();
                  if (valid) {
                    toggleModal('saveModal', true);
                  }
                }}
                className='px-3 py-3 rounded-lg'
                isDisabled={!isDirty}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* updated modal  */}
      <Modal
        isOpen={openModal.imageModal}
        onClose={() => {
          clearErrors('profile_image');
          toggleModal('imageModal', false);
        }}
        title='Upload Profile Image'
        size='sm'
      >
        <FileUpload
          multiple={false}
          NumberOfFileAllowed={1}
          accept='image/*'
          handelSubmit={files => {
            const selectedFile = files[0].file;

            if (!selectedFile) return;
            const sizeMB = selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2);
            const allowedTypes = ['image/jpg', 'image/png', 'image/jpeg'];

            if (Number(sizeMB) >= 2) {
              setError('profile_image', {
                message: 'File size should be less than 2MB',
              });
              return;
            }
            if (!allowedTypes.includes(selectedFile.type)) {
              setError('profile_image', {
                message: 'Unsupported file format. Only jpg, jpeg, png allowed',
              });
              return;
            }
            clearErrors('profile_image');
            handleUploadFile(selectedFile);
          }}
          onFileRemove={() => clearErrors('profile_image')}
        />
        <p className='text-red'>{errors.profile_image?.message}</p>
      </Modal>

      <DeleteModal
        isOpen={openModal.deleteImageModal}
        onClose={() => toggleModal('deleteImageModal', false)}
        onSubmit={onDeleteProfilePic}
        message='Are you sure you want to delete profile picture?'
      />

      <Modal
        title='Discard changes'
        size='xs'
        isOpen={openModal.cancelModal}
        onClose={() => toggleModal('cancelModal', false)}
        closeButton={false}
        contentClassName='pt-30px '
        footer={
          <div className='flex gap-5'>
            <Button
              title='Cancel'
              onClick={() => toggleModal('cancelModal', false)}
              variant='outline'
              className='rounded-lg w-full '
              parentClassName='w-2/4'
            />
            <Button
              title='Discard'
              onClick={handleDiscardChanges}
              variant='filled'
              className='rounded-lg w-full'
              parentClassName='w-2/4'
            />
          </div>
        }
      >
        <div className='flex flex-col gap-5 items-center'>
          <div className='w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center'>
            <Icon name='discard' className='icon-wrapper w-7 h-7 text-primary' />
          </div>
          <p className='text-lg text-blackdark'>Are you sure you want to discard the changes?</p>
        </div>
      </Modal>

      <Modal
        title='Save Changes'
        size='sm'
        isOpen={openModal.saveModal}
        onClose={() => toggleModal('saveModal', false)}
      >
        <div className='flex flex-col gap-5'>
          <p>Are you sure you want to save the changes?</p>
          <div className='flex gap-5'>
            <Button
              title='Cancel'
              onClick={() => toggleModal('saveModal', false)}
              variant='outline'
              className='py-3 rounded-lg'
              isDisabled={isSaving}
            />
            <Button
              title='Save Changes'
              onClick={handleSaveChanges}
              variant='filled'
              className='py-3 rounded-lg'
              isLoading={isSaving}
              isDisabled={isSaving}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
