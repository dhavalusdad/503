import { useCallback, useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { adminQueryKey } from '@/api/common/admin.query';
import { userQueryKey } from '@/api/common/user.queryKey';
import type { UserProfileResponse } from '@/api/types/user.dto';
import { useGetUserProfile, useUpdateUser, useUploadUserProfilePicture } from '@/api/user';
import defaultUserImage from '@/assets/images/default-user.webp';
import type { AdminProfileFormData } from '@/features/client/types';
import { adminProfileValidationSchema } from '@/features/client/validationSchema/profileValidation';
import { dispatchSetUser } from '@/redux/dispatch/user.dispatch';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import FileUpload from '@/stories/Common/FileUpload';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import PhoneField from '@/stories/Common/PhoneNumberInput';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

// ** Query Keys **
const ADMIN_BASIC_DETAILS_QUERY_KEY = adminQueryKey.getBasicDetailsKey();

const AdminProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState(false);
  const [deleteImageModal, setDeleteImageModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);

  const queryClient = useQueryClient();

  const {
    register,
    setValue,
    getValues,
    reset,
    trigger,
    setError,
    watch,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<AdminProfileFormData>({
    resolver: yupResolver(adminProfileValidationSchema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const { data: userData, isPending, dataUpdatedAt } = useGetUserProfile();

  const { mutateAsync: uploadProfilePicMutation, isPending: isImageLoad } =
    useUploadUserProfilePicture({});
  const { mutateAsync: updateUser, isPending: isUpdateUserApiPending } = useUpdateUser({});

  useEffect(() => {
    if (!isPending && userData) {
      const updateReduxData = {
        timezone: userData?.user_settings[0]?.timezone ?? 'UTC',
        profile_image: userData?.profile_image ?? '',
        phone: userData?.phone ?? '',
        updated_at: userData?.updated_at ?? '',
        first_name: userData?.first_name ?? '',
        last_name: userData?.last_name ?? '',
        created_at: userData?.created_at ?? '',
      };
      dispatchSetUser(updateReduxData);
    }
  }, [dataUpdatedAt, isPending, userData]);

  useEffect(() => {
    if (userData && !isEditing) {
      const userProfileData: AdminProfileFormData = {
        profile_image: userData?.profile_image ?? '',
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData?.phone ?? '',
      };

      if (userData.profile_image) {
        setProfileImage(`${SERVER_URL}${userData.profile_image}`);
      } else {
        setProfileImage(null);
      }

      reset(userProfileData, { keepErrors: false, keepDirty: false });
    }
  }, [userData, isEditing, reset]);

  useEffect(() => {
    if (profileImage !== null) {
      trigger('profile_image');
    }
  }, [profileImage, trigger]);

  const updateProfilePicDependencies = useCallback(
    (profileImg: string | null) => {
      const profileImgPath = profileImg ? `${SERVER_URL}${profileImg}` : null;
      setProfileImage(profileImgPath);

      queryClient.setQueryData<UserProfileResponse | undefined>(
        ADMIN_BASIC_DETAILS_QUERY_KEY,
        old => {
          if (!old) return old;
          return {
            ...old,
            profile_image: profileImg ?? '',
          };
        }
      );

      if (userData) {
        dispatchSetUser({ ...userData, profile_image: profileImg ?? '' });
      }
      setValue('profile_image', profileImg ?? '', { shouldDirty: true });
    },
    [queryClient, setValue, userData]
  );

  const handleUploadFile = async (file: File) => {
    try {
      // Only set the file in form state, no API call yet
      setValue('profile_image', file, { shouldDirty: true });
      setProfileImage(URL.createObjectURL(file)); // just for preview
    } catch (error: unknown) {
      console.error('Failed to process profile image:', error);
      setError('profile_image', {
        message: 'Failed to process image. Please try again.',
      });
    }
  };

  const onDeleteProfilePic = async () => {
    try {
      const formData = new FormData();
      formData.append('profile_image', '');
      updateProfilePicDependencies(null);
      setDeleteImageModal(false);
    } catch (error: unknown) {
      console.error('Failed to delete profile image:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const formData = getValues();
      const modifiedFormData = { ...formData };
      delete modifiedFormData.email;

      // ✅ If profile_image is a File, upload first
      if (modifiedFormData.profile_image instanceof File) {
        const imgFormData = new FormData();
        imgFormData.append('profile_image', modifiedFormData.profile_image);

        const { data: resData } = await uploadProfilePicMutation(imgFormData);
        modifiedFormData.profile_image = resData.path;
      }

      const { data: updatedUser } = await updateUser(modifiedFormData);

      if (updatedUser) {
        dispatchSetUser({ ...updatedUser });
        reset(modifiedFormData, { keepErrors: false, keepDirty: false });
        await queryClient.invalidateQueries({
          queryKey: userQueryKey.useGetUserProfile(),
          refetchType: 'active',
        });
      }

      setIsEditing(false);
      setSaveModal(false);
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
    }
  };

  const handleDiscardChanges = () => {
    if (userData) {
      const userProfileData: AdminProfileFormData = {
        profile_image: userData?.profile_image ?? '',
        first_name: userData.first_name,
        last_name: userData.last_name,

        phone: userData?.phone ?? '',
      };

      reset(userProfileData, { keepErrors: false, keepDirty: false });
      if (userData?.profile_image) {
        setProfileImage(`${SERVER_URL}${userData.profile_image}`);
      } else {
        setProfileImage(null);
      }
    }
    setCancelModal(false);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleCancelModal = () => {
    if (isDirty) {
      setCancelModal(true);
    } else {
      setIsEditing(false);
    }
  };

  return (
    <>
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
                imageClassName='rounded-full object-cover object-center'
                className='w-108px h-108px bg-surface rounded-full overflow-hidden flex items-center justify-center'
              />
              {isEditing && (
                <div className='flex items-center gap-3'>
                  <Button
                    title='Upload Image'
                    variant='filled'
                    onClick={() => setImageModal(true)}
                    className='!py-1.5 !px-2 rounded-lg !text-sm'
                    icon={<Icon name='upload' className='icon-wrapper w-5 h-5' />}
                    isIconFirst
                    isLoading={isImageLoad}
                  />
                  {profileImage && (
                    <Button
                      title='Delete'
                      variant='none'
                      onClick={() => setDeleteImageModal(true)}
                      isDisabled={isUpdateUserApiPending}
                      className='!p-0 rounded-none text-red !font-medium'
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          {!isEditing && (
            <Button
              title='Edit Profile'
              variant='filled'
              onClick={handleEditToggle}
              className='!px-2 !py-1.5 rounded-lg !text-sm'
              icon={<Icon name='edit' className='icon-wrapper w-4 h-4' />}
              isIconFirst
            />
          )}
        </div>

        <div className='w-full h-1px bg-surface my-30px'></div>

        {/* Client Information Form */}
        <div className='relative'>
          <h6 className='text-lg font-bold leading-6 text-blackdark mb-5'>Client Information</h6>
          <div className='grid sm:grid-cols-2 grid-cols-1 gap-x-25px gap-y-5'>
            <InputField
              type='text'
              label='First Name'
              labelClass='!text-base'
              register={register}
              name='first_name'
              error={errors.first_name?.message}
              isDisabled={!isEditing}
              isRequired={true}
              placeholder='First Name'
              inputClass='!text-base !leading-5 !text-primarygray bg-Gray'
            />

            <InputField
              type='text'
              label='Last Name'
              labelClass='!text-base'
              register={register}
              name='last_name'
              error={errors.last_name?.message}
              isDisabled={!isEditing}
              isRequired={true}
              placeholder='Last Name'
              inputClass='!text-base !leading-5 !text-primarygray bg-Gray'
            />

            <InputField
              type='email'
              label='Email'
              labelClass='!text-base'
              register={register}
              name='email'
              error={errors.email?.message}
              isDisabled={true}
              isRequired={true}
              placeholder='Email'
              inputClass='!text-base !leading-5 !text-primarygray bg-Gray'
            />

            <PhoneField
              label='Contact Number'
              labelClass='!text-base'
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
              inputClass={`!text-base !leading-5 !bg-Gray ${
                errors.phone && errors.phone.message ? 'border-red-500' : ''
              }`}
              buttonClass='!bg-Gray'
            />
          </div>
        </div>

        {/* Action buttons */}
        {isEditing && (
          <div className='flex items-center justify-end gap-5 mt-30px pt-30px border-t border-solid border-surface'>
            <Button
              title='Cancel'
              variant='outline'
              onClick={handleCancelModal}
              className='px-3 py-3 rounded-lg'
              isDisabled={isUpdateUserApiPending}
            />
            <Button
              title={'Save Changes'}
              variant='filled'
              onClick={async () => {
                const valid = await trigger();
                if (valid) {
                  setSaveModal(true);
                }
              }}
              className='px-3 py-3 rounded-lg'
              isDisabled={!isDirty || isUpdateUserApiPending}
              isLoading={isUpdateUserApiPending}
            />
          </div>
        )}
      </div>
      {/* Upload Image Modal */}
      <Modal
        isOpen={imageModal}
        onClose={() => {
          clearErrors('profile_image');
          setImageModal(false);
        }}
        title='Upload Profile Image'
        size='sm'
        contentClassName='pt-30px'
      >
        <FileUpload
          multiple={false}
          NumberOfFileAllowed={1}
          accept='image/*'
          handelSubmit={async (files: { file: File }[]) => {
            const selectedFile = files[0]?.file;
            if (!selectedFile) return;

            const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
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
            await handleUploadFile(selectedFile);
            setImageModal(false);
          }}
          onFileRemove={() => clearErrors('profile_image')}
        />
        {errors.profile_image?.message && (
          <p className='text-red mt-2'>{errors.profile_image.message}</p>
        )}
      </Modal>

      {/* Delete Image Modal */}
      <DeleteModal
        isOpen={deleteImageModal}
        onClose={() => setDeleteImageModal(false)}
        onSubmit={onDeleteProfilePic}
        message='Are you sure you want to delete profile picture?'
      />

      {/* Cancel Changes Modal */}
      <Modal
        title='Discard changes'
        size='xs'
        isOpen={cancelModal}
        closeButton={false}
        contentClassName='pt-30px'
        onClose={() => setCancelModal(false)}
        footer={
          <div className='flex items-center gap-5'>
            <Button
              title='Cancel'
              onClick={() => setCancelModal(false)}
              variant='outline'
              className='rounded-lg w-full min-h-50px'
              parentClassName='w-2/4'
            />
            <Button
              title='Discard'
              onClick={handleDiscardChanges}
              variant='filled'
              className='rounded-lg w-full min-h-50px'
              parentClassName='w-2/4'
            />
          </div>
        }
      >
        <div className='flex flex-col gap-5 items-center'>
          <div className='w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center'>
            <Icon name='discard' className='icon-wrapper w-7 h-7 text-primary' />
          </div>
          <p className='text-lg text-blackdark font-medium leading-6'>
            Are you sure you want to discard the changes?
          </p>
        </div>
      </Modal>

      {/* Save Changes Modal */}
      <Modal
        title='Save Changes'
        size='xs'
        isOpen={saveModal}
        onClose={() => {
          if (!isUpdateUserApiPending) setSaveModal(false);
        }}
        closeButton={false}
        contentClassName='pt-30px'
        footer={
          <div className='flex items-center gap-5'>
            <Button
              title='Cancel'
              onClick={() => setSaveModal(false)}
              variant='outline'
              className='rounded-lg w-full min-h-50px'
              isDisabled={isUpdateUserApiPending}
              parentClassName='w-2/4'
            />
            <Button
              title={isUpdateUserApiPending ? 'Saving...' : 'Save Changes'}
              onClick={handleSaveChanges}
              variant='filled'
              className='rounded-lg w-full min-h-50px'
              isDisabled={isUpdateUserApiPending}
              isLoading={isUpdateUserApiPending}
              parentClassName='w-2/4'
            />
          </div>
        }
      >
        <div className='flex flex-col gap-5 items-center'>
          <div className='w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center'>
            <Icon name='sync' className='icon-wrapper w-7 h-7 text-primary' />
          </div>
          <p className='text-lg text-blackdark font-medium leading-6'>
            Are you sure you want to save the changes?
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AdminProfile;
