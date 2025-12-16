import { useEffect, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Controller, FormProvider, type Resolver } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { getClinicAddressesListAsync } from '@/api/clinic-addresses';
import { languageQueryKey } from '@/api/common/language.queryKey';
import { therapistQueryKey } from '@/api/common/therapist.queryKey.ts';
import { getFieldOptionsAsyncByTherapistId, useGetFieldOptionsByType } from '@/api/field-option';
import { getLanguagesAsync } from '@/api/language';
import {
  useCreateTherapist,
  useGetTherapistBasicDetails,
  useUpdateTherapistBasicDetails,
} from '@/api/therapist';
import type { OptionType } from '@/api/types/field-option.dto';
import type { GetTherapistBasicDetailsResponse } from '@/api/types/therapist.dto';
import { UserRole } from '@/api/types/user.dto';
import { useUpdateUser, useUploadUserProfilePicture } from '@/api/user';
import { getAddedAndRemovedItems } from '@/api/utils';
import defaultUserPng from '@/assets/images/default-user.webp';
import { GENDER_OPTION, MARTIAL_STATUS_OPTION } from '@/constants/CommonConstant';
import { ROUTES } from '@/constants/routePath';
import { FieldOptionType, SessionType } from '@/enums';
import { QUEUE_REQUEST_METADATA_FIELD_NAME } from '@/features/admin/components/backofficeQueue/constant';
import { therapistProfileSchema } from '@/features/profile/components/ProfileValidationSchema';
import TherapistAddress from '@/features/profile/components/TherapistAddress';
import ProfileTippy from '@/features/profile/components/TherapistProfileTippy';
import { PANEL_TYPE, THERAPIST_PROFILE_REQUIRED_FIELDS } from '@/features/profile/constants';
import type { TherapistProfileFormData } from '@/features/profile/types';
import { getDashboardPath, isAdminPanelRole } from '@/helper';
import { useForm } from '@/hooks/useForm';
import { SessionTypeLabelEnum } from '@/pages/Profile/enums';
import { dispatchSetUser } from '@/redux/dispatch/user.dispatch';
import { currentUser } from '@/redux/ducks/user';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import FileUpload from '@/stories/Common/FileUpload';
import Image from '@/stories/Common/Image';
import { InputField } from '@/stories/Common/Input';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import Modal from '@/stories/Common/Modal';
import { NumberField } from '@/stories/Common/NumberField';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select, { CustomAsyncSelect } from '@/stories/Common/Select';
import TextArea from '@/stories/Common/Textarea';

interface OldDataRefType
  extends Omit<
    GetTherapistBasicDetailsResponse['data'],
    | 'session_types'
    | 'languages'
    | 'therapy_types'
    | 'area_of_focus'
    | 'email_verified'
    | 'clinic_address'
  > {
  video_session: boolean;
  clinic_session: boolean;
  languages: OptionType[];
  therapy_types: OptionType[];
  area_of_focus: OptionType[];
  clinic_address: OptionType[];
}

type ModalType = {
  fileUpload: boolean;
  deleteProfile: boolean;
  discard: boolean;
};

type OptionsType = { id: string; name: string }[];

const SERVER_URL = import.meta.env.VITE_BASE_URL;

export const ProfileForm = () => {
  // *** States ***
  const [openModal, setOpenModal] = useState<ModalType>({
    fileUpload: false,
    deleteProfile: false,
    discard: false,
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isAllOptionsFetched, setIsAllOptionsFetched] = useState(false);

  // ** Redux **
  const currentUserData = useSelector(currentUser);

  // ** Query Client **
  const queryClient = useQueryClient();

  // ** Query Keys **
  const THERAPIST_BASIC_DETAILS_QUERY_KEY = therapistQueryKey.getBasicDetailsKey();

  // *** Hooks ***
  const navigate = useNavigate();
  const params = useParams();

  // ** Vars **
  const { role } = currentUserData;
  const isAdmin = isAdminPanelRole(role);
  const { therapist_id } = params;
  const thisPanel: PANEL_TYPE = isAdmin ? PANEL_TYPE.ADMIN : PANEL_TYPE.THERAPIST;

  // *** Hook Form ***
  const formResolver: Resolver<TherapistProfileFormData> = yupResolver(therapistProfileSchema);
  const defaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phone: null,
    dob: null,
    gender: null,
    marital_status: null,
    languages: [],
    area_of_focus: [],
    clinic_address: null,
    video_session: false,
    clinic_session: false,
    address1: '',
    address2: '',
    bio: '',
    profile_image: null,
    therapy_types: [],
    npi_number: '',
    min_patient_age: '',
    max_patient_age: '',
    state: null,
    city: null,
    country: null,
    postal_code: '',
  };
  const methods = useForm<TherapistProfileFormData>({
    resolver: formResolver,
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues,
    context: { isTherapistPanel: !isAdmin },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    getValues,
    setValue,
    control,
    setError,
    clearErrors,
    watch,
    trigger,
  } = methods;

  // *** Refs ***
  const specializationOptionsRef = useRef<OptionType[]>([]);
  const oldValuesRef = useRef<OldDataRefType>(null);
  const hasFetchedOnceRef = useRef(false);
  const therapyTypeOptionsRef = useRef<OptionType[]>([]);
  const therapistProfileDataOldValues = useRef<TherapistProfileFormData | null>(null);

  // *** Services ***
  const {
    data: specializationsData,
    isSuccess: isAreaOfFocusApiSucceed,
    dataUpdatedAt: areaOfFocusDataUpdatedAt,
  } = useGetFieldOptionsByType({
    fieldOptionType: FieldOptionType.AREA_OF_FOCUS,
    options: {
      staleTime: 1000 * 60 * 60,
    },
  });

  const {
    data: therapyTypeData,
    isSuccess: isTherapyTypeApiSucceed,
    dataUpdatedAt: therapyTypeDataUpdatedAt,
  } = useGetFieldOptionsByType({
    fieldOptionType: FieldOptionType.THERAPY_TYPE,
    options: {
      staleTime: 1000 * 60 * 60,
    },
  });

  const {
    data: therapistData,
    isPending: isTherapistDetailsApiPending,
    dataUpdatedAt: therapistDataUpdatedAt,
    isFetching: isTherapistDetailsApiFetching,
    isFetched: isTherapistDetailsApiFetched,
    refetch,
  } = useGetTherapistBasicDetails({
    therapist_id,
    options: {
      enabled: isAdmin
        ? therapist_id
          ? !!isAreaOfFocusApiSucceed && !!isTherapyTypeApiSucceed && !!therapist_id
          : false
        : !!isAreaOfFocusApiSucceed && !!isTherapyTypeApiSucceed && !hasFetchedOnceRef.current,
    },
  });

  const {
    mutateAsync: createBasicDetailsMutation,
    isPending: isCreateBasicDetailsApiPending,
    isError: createTherapistProfileDetailsError,
  } = useCreateTherapist({});

  const {
    mutateAsync: updateBasicDetailsMutation,
    isPending: isUpdateBasicDetailsApiPending,
    isError: updateTherapistBasicDetailsError,
  } = useUpdateTherapistBasicDetails({ therapist_id });

  const { mutateAsync: uploadProfilePicMutation, isPending: isUploadProfilePicLoading } =
    useUploadUserProfilePicture({});

  const { mutateAsync: updateUser, isPending: isUpdateUserApiPending } = useUpdateUser({});

  // *** Helpers ***
  const isFieldInRequest = (fieldName: string): boolean => {
    return !isAdmin && Object.keys(therapistData?.inRequestFields || {})?.includes(fieldName)
      ? true
      : false;
  };

  const updateProfilePicDependencies = (profileImg: string | null) => {
    const profileImgPath = profileImg ? `${SERVER_URL}${profileImg}` : profileImg;
    setProfileImage(profileImgPath);
    queryClient.setQueryData(THERAPIST_BASIC_DETAILS_QUERY_KEY, (old: object) => {
      return {
        ...old,
        profile_image: profileImg,
      };
    });
    dispatchSetUser({ profile_image: profileImg });
    setValue('profile_image', profileImg);
  };

  const modifyOptionObj = (items: OptionsType) =>
    _.isArray(items) && _.isObject(items[0])
      ? items.map((item: { id: string; name: string }) => ({ label: item.name, value: item.id }))
      : [];

  const objectToFormData = (obj: Record<string, string | Date | File | Blob>): FormData => {
    const formData = new FormData();

    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (value instanceof Date) {
        const utcDate = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
        formData.append(key, utcDate.toISOString());
      } else if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  };

  const handleReset = (data?: GetTherapistBasicDetailsResponse['data']) => {
    const detailsData = data || oldValuesRef.current;
    if (detailsData && Object.keys(detailsData).length) {
      const {
        first_name,
        languages,
        last_name,
        area_of_focus,
        bio,
        clinic_address,
        dob,
        email,
        gender,
        marital_status,
        profile_image,
        phone,
        therapy_types,
        npi_number,
        min_patient_age,
        max_patient_age,
        address1,
        address2,
        state,
        country,
        postal_code,
        city,
        session_types,
      } = detailsData;

      const modifiedObj = {
        first_name,
        last_name,
        bio: bio ?? defaultValues.bio,
        email,
        phone: phone && !phone.startsWith('+') ? `+1${phone}` : phone,
        clinic_address: clinic_address,
        dob: dob ? new Date(dob) : null,
        languages: modifyOptionObj(languages as OptionsType),
        area_of_focus: modifyOptionObj(area_of_focus as OptionsType),
        therapy_types: modifyOptionObj(therapy_types as OptionsType),
        gender: gender ? { label: gender, value: gender } : null,
        marital_status: marital_status ? { label: marital_status, value: marital_status } : null,
        profile_image,
        ...(session_types?.length
          ? {
              video_session: session_types.includes(SessionType.VIRTUAL),
              clinic_session: session_types.includes(SessionType.CLINIC),
            }
          : {
              video_session: false,
              clinic_session: false,
            }),
        npi_number: npi_number ?? defaultValues.npi_number,
        min_patient_age: min_patient_age ?? defaultValues.min_patient_age,
        max_patient_age: max_patient_age ?? defaultValues.max_patient_age,
        address1,
        address2,
        state,
        country,
        postal_code,
        city: city?.state_id === state?.value ? city : null,
      };

      // Set queue request field values
      const clonedModifiedObj = { ...modifiedObj };
      const requestData = therapistData?.inRequestFields;
      if (isAdmin) {
        reset(modifiedObj);
      } else {
        therapistProfileDataOldValues.current = clonedModifiedObj;
        const finalObj = requestData
          ? {
              ...modifiedObj,
              first_name:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.FIRST_NAME] ?? modifiedObj.first_name,
              last_name:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.LAST_NAME] ?? modifiedObj.last_name,
              bio: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.BIO] ?? modifiedObj.bio,
              clinic_address:
                (requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.CLINIC_ADDRESS] || []).map(
                  (item: { id: string; name: string; address: string }) => ({
                    value: item.id,
                    label: `${item.name} - ${item.address}`,
                  })
                ) ?? modifiedObj.clinic_address,
              phone: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.PHONE] ?? modifiedObj.phone,
              dob: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.DOB]
                ? new Date(requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.DOB])
                : modifiedObj.dob,
              languages: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.LANGUAGE]
                ? modifyOptionObj(
                    requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.LANGUAGE] as OptionsType
                  )
                : modifiedObj.languages,
              area_of_focus: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.AREA_OF_FOCUS]
                ? modifyOptionObj(
                    requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.AREA_OF_FOCUS] as OptionsType
                  )
                : modifiedObj.area_of_focus,
              therapy_types: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.THERAPY_TYPE]
                ? modifyOptionObj(
                    requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.THERAPY_TYPE] as OptionsType
                  )
                : modifiedObj.therapy_types,
              gender: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.GENDER]
                ? {
                    label: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.GENDER],
                    value: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.GENDER],
                  }
                : modifiedObj.gender,
              marital_status: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.MARITAL_STATUS]
                ? {
                    label: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.MARITAL_STATUS],
                    value: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.MARITAL_STATUS],
                  }
                : modifiedObj.marital_status,
              npi_number:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.NPI_NUMBER] ?? modifiedObj.npi_number,
              min_patient_age:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.MIN_PATIENT_AGE] ??
                modifiedObj.min_patient_age,
              max_patient_age:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.MAX_PATIENT_AGE] ??
                modifiedObj.max_patient_age,
              address1:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.ADDRESS1] ?? modifiedObj.address1,
              address2:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.ADDRESS2] ?? modifiedObj.address2,
              state: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.STATE] ?? modifiedObj.state,
              country:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.COUNTRY] ?? modifiedObj.country,
              postal_code:
                requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.POSTAL_CODE] ??
                modifiedObj.postal_code,
              city: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.CITY] ?? modifiedObj.city,
              video_session: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.SESSION_TYPE]
                ? requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.SESSION_TYPE].includes(
                    SessionType.VIRTUAL
                  )
                : modifiedObj.video_session,
              clinic_session: requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.SESSION_TYPE]
                ? requestData[QUEUE_REQUEST_METADATA_FIELD_NAME.SESSION_TYPE].includes(
                    SessionType.CLINIC
                  )
                : modifiedObj.clinic_session,
            }
          : modifiedObj;
        reset(finalObj);
      }

      if (profile_image) {
        setProfileImage(`${SERVER_URL}${profile_image}`);
      }
      return modifiedObj;
    }
  };

  const uploadProfilePic = async (file: File) => {
    const formData = new FormData();
    formData.append('profile_image', file);
    if (isAdmin) {
      const img = URL.createObjectURL(file);
      setProfileImage(img);
      setValue('profile_image', file, { shouldDirty: true });
    } else {
      const { data: resData } = await uploadProfilePicMutation(formData);
      updateProfilePicDependencies(resData.path);
    }
  };

  const onDeleteProfilePic = async () => {
    if (isAdmin) {
      setValue('profile_image', null, { shouldDirty: true });
      setProfileImage(null);
    } else {
      await updateUser({ profile_image: null, toastMessage: 'Profile Image deleted successfully' });
      updateProfilePicDependencies(null);
    }
    openCloseModal('deleteProfile', false);
  };

  const openCloseModal = (modalName: keyof ModalType, actionBool: boolean = false) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
    }));
  };

  const onSubmit = async () => {
    const vals = getValues();
    const {
      address1,
      address2,
      city,
      state,
      country,
      postal_code,
      area_of_focus,
      bio,
      clinic_address,
      clinic_session,
      dob,
      email,
      first_name,
      gender,
      languages,
      last_name,
      marital_status,
      phone,
      video_session,
      therapy_types,
      npi_number,
      min_patient_age,
      max_patient_age,
    } = vals;

    const langs = getAddedAndRemovedItems(languages, oldValuesRef.current?.languages);

    const specializations = getAddedAndRemovedItems(
      area_of_focus,
      oldValuesRef.current?.area_of_focus
    );

    const therapyTypes = getAddedAndRemovedItems(
      therapy_types,
      oldValuesRef.current?.therapy_types
    );

    const clinicAddress = getAddedAndRemovedItems(
      Array.isArray(clinic_address) ? clinic_address : clinic_address ? [clinic_address] : [],
      Array.isArray(oldValuesRef.current?.clinic_address)
        ? oldValuesRef.current.clinic_address
        : oldValuesRef.current?.clinic_address
          ? [oldValuesRef.current.clinic_address]
          : []
    );

    const newSessionTypesArr: OptionType[] = [];
    const virtualSessionOption = { label: SessionType.VIRTUAL, value: SessionType.VIRTUAL };
    const clinicSessionOption = { label: SessionType.CLINIC, value: SessionType.CLINIC };
    if (video_session) {
      newSessionTypesArr.push(virtualSessionOption);
    }
    if (clinic_session) {
      newSessionTypesArr.push(clinicSessionOption);
    }
    const oldSessionTypeArr: OptionType[] = [];
    if (oldValuesRef.current?.video_session) {
      oldSessionTypeArr.push(virtualSessionOption);
    }
    if (oldValuesRef.current?.clinic_session) {
      oldSessionTypeArr.push(clinicSessionOption);
    }

    const sessionTypes = getAddedAndRemovedItems(newSessionTypesArr, oldSessionTypeArr);
    const payload = {
      first_name,
      last_name,
      bio,
      clinic_address: clinicAddress,
      area_of_focus: specializations,
      therapy_type: therapyTypes,
      email: isAdmin && !therapist_id ? email : oldValuesRef.current?.email,
      dob,
      gender: gender?.value,
      marital_status: marital_status?.value,
      phone,
      session_type: sessionTypes,
      languages: langs,
      profile_image: isAdmin
        ? getValues('profile_image')
        : profileImage
          ? profileImage.substring(profileImage.indexOf('/uploads'))
          : null,
      npi_number,
      min_patient_age,
      max_patient_age,
      address1,
      address2,
      city: city ? city.value : '',
      state: state ? state.value : '',
      country: country ? country.value : '',
      postal_code,
    };

    if (isAdmin) {
      const formData = objectToFormData(payload);
      if (therapist_id) {
        await updateBasicDetailsMutation(formData);
      } else {
        await createBasicDetailsMutation(formData);
      }
    } else {
      await updateBasicDetailsMutation(payload);

      refetch();
    }

    if (isAdmin) {
      if (!createTherapistProfileDetailsError || !updateTherapistBasicDetailsError) {
        if (!therapist_id) {
          navigate(ROUTES.THERAPIST_MANAGEMENT.path);
        }
      }
    } else {
      if (!updateTherapistBasicDetailsError) {
        oldValuesRef.current = vals;
        reset(vals);
        queryClient.invalidateQueries({ queryKey: [THERAPIST_BASIC_DETAILS_QUERY_KEY] });
        dispatchSetUser({ first_name, last_name });
      }
    }
  };

  const onCancel = () => {
    openCloseModal('discard');
    handleReset();
    if (isAdmin) {
      navigate(ROUTES.THERAPIST_MANAGEMENT.path);
    } else {
      navigate(getDashboardPath(role as UserRole));
    }
  };

  const checkIsRequiredField = (field: keyof TherapistProfileFormData) => {
    return THERAPIST_PROFILE_REQUIRED_FIELDS[field].includes(thisPanel);
  };

  const checkIfFieldIsDisabled = (field_name: string) => {
    let isDisabled = false;
    switch (field_name) {
      case 'email':
        isDisabled = !isAdmin || (isAdmin && !!therapist_id);
        break;
      default:
        isDisabled = isFieldInRequest(field_name);
        break;
    }
    return isDisabled;
  };

  // *** Effects ***
  useEffect(() => {
    if (specializationsData?.length) {
      specializationOptionsRef.current = specializationsData.map(option => ({
        label: option.name,
        value: option.id,
      }));
    }
  }, [areaOfFocusDataUpdatedAt]);

  useEffect(() => {
    if (therapyTypeData?.length) {
      therapyTypeOptionsRef.current = therapyTypeData.map(therapyType => ({
        label: therapyType.name,
        value: therapyType.id,
      }));
    }
  }, [therapyTypeDataUpdatedAt]);

  useEffect(() => {
    if (therapistData) {
      if (isAdmin) {
        if (therapist_id) {
          const initialData = handleReset(therapistData);
          if (therapistData.profile_image) {
            setProfileImage(`${SERVER_URL}${therapistData.profile_image}`);
          }
          if (initialData) {
            oldValuesRef.current = initialData;
          }
        }
      } else {
        const isFreshFetch = isTherapistDetailsApiFetched && !isTherapistDetailsApiFetching;
        if (isFreshFetch && therapistData && !hasFetchedOnceRef.current) {
          const initialData = handleReset(therapistData);
          if (initialData) {
            oldValuesRef.current = initialData;
          }
          hasFetchedOnceRef.current = true;
        }
      }
    }
  }, [therapistDataUpdatedAt]);

  useEffect(() => {
    if (specializationsData?.length && therapyTypeData?.length) {
      setIsAllOptionsFetched(true);
    }
  }, [specializationsData, therapyTypeData]);

  return (
    <>
      {(isAdmin
        ? therapist_id
          ? isTherapistDetailsApiPending
          : !isAllOptionsFetched
        : isTherapistDetailsApiPending) || isTherapistDetailsApiFetching ? (
        <SectionLoader />
      ) : (
        <>
          {' '}
          <div className='bg-white rounded-20px border border-solid border-surface p-5'>
            {/* Profile Picture Section */}
            <div className='mb-5'>
              {!isAdmin && (
                <div className='w-full flex items-center justify-between mb-5'>
                  <h3 className='text-lg font-bold text-blackdark leading-6'>Profile Picture</h3>
                  {Object.keys(therapistData?.inRequestFields || {}).length ? (
                    <span className='inline-flex items-center rounded-full bg-primary/10 text-primary text-sm font-medium px-3 py-1'>
                      In Request Mode
                    </span>
                  ) : (
                    <></>
                  )}
                </div>
              )}
              <div className='flex sm:flex-row flex-col items-center gap-5 border border-solid rounded-2xl  p-3.5 border-Gray'>
                <Image
                  imgPath={
                    profileImage
                      ? profileImage
                      : watch('first_name') && watch('last_name')
                        ? ''
                        : defaultUserPng
                  }
                  firstName={getValues('first_name')}
                  lastName={getValues('last_name')}
                  alt='Profile'
                  imageClassName='rounded-full object-cover object-center w-full h-full flex items-center justify-center'
                  className='w-84px text-base h-84px bg-surface rounded-full overflow-hidden flex items-center justify-center'
                />
                <div className='flex flex-col gap-1.5'>
                  <p className='text-base font-normal leading-22px text-blackdark'>Profile Image</p>
                  <div className='flex items-center gap-3.5'>
                    <Button
                      variant='filled'
                      title='Upload Image'
                      className='!px-2.5 !py-1.5 !text-sm !leading-18px rounded-md'
                      type='button'
                      onClick={() => openCloseModal('fileUpload', true)}
                    />
                    {Boolean(profileImage) && (
                      <Button
                        variant='none'
                        title='Delete'
                        className='!p-0 text-red !font-bold'
                        type='button'
                        onClick={() => openCloseModal('deleteProfile', true)}
                        isDisabled={isUpdateUserApiPending}
                      />
                    )}
                  </div>
                  <p className='text-sm font-normal leading-18px text-primarygray'>
                    Your image should be below 2 MB, accepted formats: jpg, png.
                  </p>
                </div>
              </div>
            </div>

            {/* Information Section */}
            {/* <form onSubmit={handleSubmit(onSubmit)}>*/}
            <div className='relative'>
              <h3 className='text-lg font-bold text-blackdark leading-6 mb-5'>Information</h3>
              {/* Name, Email, Phone */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-25px gap-y-5 mb-5 items-start'>
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.FIRST_NAME)}
                >
                  <InputField
                    type='text'
                    label='First Name'
                    labelClass='!text-base'
                    placeholder='Enter first name'
                    register={register}
                    name='first_name'
                    error={errors.first_name?.message}
                    inputClass={'!text-base !leading-5'}
                    isRequired={checkIsRequiredField('first_name')}
                    isDisabled={checkIfFieldIsDisabled(
                      QUEUE_REQUEST_METADATA_FIELD_NAME.FIRST_NAME
                    )}
                  />
                </ProfileTippy>
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.LAST_NAME)}
                >
                  <InputField
                    type='text'
                    label='Last Name'
                    labelClass='!text-base'
                    placeholder='Enter last name'
                    register={register}
                    name='last_name'
                    error={errors.last_name?.message}
                    inputClass={'!text-base !leading-5'}
                    isRequired={checkIsRequiredField('last_name')}
                    isDisabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.LAST_NAME)}
                  />
                </ProfileTippy>
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.EMAIL)}
                  label='Email is not editable'
                >
                  <InputField
                    type='email'
                    label='Email Address'
                    labelClass='!text-base'
                    placeholder='Enter email address'
                    register={register}
                    name='email'
                    error={errors.email?.message}
                    inputClass={'!text-base !leading-5'}
                    isDisabled={!isAdmin || (isAdmin && !!therapist_id)}
                    isRequired={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.EMAIL)}
                  />
                </ProfileTippy>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-25px gap-y-5 mb-5 items-start'>
                {/* Phone and DOB */}
                {/* Make Checkbox start to red */}
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.PHONE)}
                >
                  <PhoneField
                    control={control}
                    name='phone'
                    label={'Contact Number'}
                    labelClass='!text-base'
                    isRequired={checkIsRequiredField('phone')}
                    parentClassName='w-full border-primarylight'
                    inputClass={` !text-base !leading-6 !p-3 ${errors.phone && errors.phone.message ? 'border-red-500' : ''} `}
                    country='us'
                    enableSearch={true}
                    error={errors.phone && errors.phone.message}
                    isReadOnly={false}
                    isModal={false}
                    disabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.PHONE)}
                  />
                </ProfileTippy>
                <div className='profile-datepicker'>
                  <Controller
                    name='dob'
                    control={control}
                    rules={{
                      required: checkIsRequiredField('dob'),
                    }}
                    render={({ field, fieldState }) => (
                      <ProfileTippy
                        enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.DOB)}
                      >
                        <CustomDatePicker
                          label='Date of Birth'
                          labelClass='!text-base'
                          placeholderText='Select date of birth'
                          error={fieldState.error?.message}
                          selected={field.value}
                          onChange={date => field.onChange(date ? new Date(date) : null)}
                          maxDate={new Date()}
                          maxAge={130}
                          isRequired={checkIsRequiredField('dob')}
                          disabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.DOB)}
                        />
                      </ProfileTippy>
                    )}
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-25px gap-y-5 mb-5 items-start'>
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.GENDER)}
                >
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
                    isRequired={checkIsRequiredField('gender')}
                    isDisabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.GENDER)}
                  />
                </ProfileTippy>
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.MARITAL_STATUS)}
                >
                  <Select
                    label={'Marital Status'}
                    options={MARTIAL_STATUS_OPTION}
                    control={control}
                    placeholder='Select marital status'
                    error={errors.marital_status?.message}
                    name='marital_status'
                    labelClassName='!text-base'
                    StylesConfig={{
                      control: () => ({
                        minHeight: '50px',
                        padding: '4px 6px',
                      }),
                      singleValue: () => ({
                        fontSize: '16px',
                      }),
                      option: () => ({
                        fontSize: '16px',
                      }),
                    }}
                    isRequired={checkIsRequiredField('marital_status')}
                    isDisabled={checkIfFieldIsDisabled(
                      QUEUE_REQUEST_METADATA_FIELD_NAME.MARITAL_STATUS
                    )}
                  />
                </ProfileTippy>
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.NPI_NUMBER)}
                >
                  <InputField
                    type='text'
                    label='NPI Number'
                    labelClass='!text-base'
                    placeholder='Enter NPI number'
                    register={register}
                    name='npi_number'
                    error={errors.npi_number?.message}
                    inputClass={'!text-base !leading-5'}
                    maxLength={10}
                    onInput={e => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                    }}
                    isRequired={checkIsRequiredField('npi_number')}
                    isDisabled={checkIfFieldIsDisabled(
                      QUEUE_REQUEST_METADATA_FIELD_NAME.NPI_NUMBER
                    )}
                  />
                </ProfileTippy>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-25px gap-y-5 mb-5 items-start'>
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.MIN_PATIENT_AGE)}
                >
                  <NumberField
                    label='Minimum Patient Age'
                    labelClass='!text-base'
                    placeholder='Enter age'
                    register={register}
                    name='min_patient_age'
                    inputClass={'!text-base !leading-5'}
                    error={errors.min_patient_age?.message}
                    isRequired={checkIsRequiredField('min_patient_age')}
                    isDisabled={checkIfFieldIsDisabled(
                      QUEUE_REQUEST_METADATA_FIELD_NAME.MIN_PATIENT_AGE
                    )}
                  />
                </ProfileTippy>
                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.MAX_PATIENT_AGE)}
                >
                  <NumberField
                    label='Maximum Patient Age'
                    labelClass='!text-base'
                    placeholder='Enter age'
                    register={register}
                    name='max_patient_age'
                    inputClass='!text-base !leading-5'
                    error={errors.max_patient_age?.message}
                    isRequired={checkIsRequiredField('max_patient_age')}
                    isDisabled={checkIfFieldIsDisabled(
                      QUEUE_REQUEST_METADATA_FIELD_NAME.MAX_PATIENT_AGE
                    )}
                  />
                </ProfileTippy>
              </div>
              <div className='flex flex-col gap-5'>
                {/* Languages */}
                <Controller
                  name='languages'
                  control={control}
                  render={({ field }) => (
                    <ProfileTippy
                      enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.LANGUAGE)}
                    >
                      <CustomAsyncSelect
                        label='Languages'
                        labelClassName='!text-base'
                        loadOptions={getLanguagesAsync}
                        queryKey={languageQueryKey.getLanguagesKey()}
                        pageSize={10}
                        isMulti
                        placeholder='Select Languages'
                        onChange={field.onChange}
                        value={field.value}
                        error={errors.languages && errors.languages?.message}
                        StylesConfig={{
                          control: () => ({
                            minHeight: '50px',
                            padding: '4px 6px',
                          }),
                          singleValue: () => ({
                            fontSize: '16px',
                          }),
                          option: () => ({
                            fontSize: '16px',
                          }),
                        }}
                        isRequired={checkIsRequiredField('languages')}
                        isDisabled={checkIfFieldIsDisabled(
                          QUEUE_REQUEST_METADATA_FIELD_NAME.LANGUAGE
                        )}
                      />
                    </ProfileTippy>
                  )}
                />

                {/* Specializations */}
                <Controller
                  name='area_of_focus'
                  control={control}
                  render={({ field }) => (
                    <ProfileTippy
                      enable={checkIfFieldIsDisabled(
                        QUEUE_REQUEST_METADATA_FIELD_NAME.AREA_OF_FOCUS
                      )}
                      placement='top-start'
                    >
                      <CustomAsyncSelect
                        label={'Specialized In'}
                        labelClassName='!text-base'
                        loadOptions={(page, searchTerm) =>
                          getFieldOptionsAsyncByTherapistId(
                            FieldOptionType.AREA_OF_FOCUS,
                            page,
                            searchTerm
                          )
                        }
                        queryKey={'area-of-focus-options'}
                        pageSize={10}
                        onChange={field.onChange}
                        value={field.value}
                        name='area_of_focus'
                        placeholder='Select Expertise'
                        error={errors.area_of_focus && errors.area_of_focus?.message}
                        isMulti
                        StylesConfig={{
                          control: () => ({
                            minHeight: '50px',
                            padding: '4px 6px',
                          }),
                          singleValue: () => ({
                            fontSize: '16px',
                          }),
                          option: () => ({
                            fontSize: '16px',
                          }),
                        }}
                        isRequired={checkIsRequiredField('area_of_focus')}
                        isDisabled={checkIfFieldIsDisabled(
                          QUEUE_REQUEST_METADATA_FIELD_NAME.AREA_OF_FOCUS
                        )}
                      />
                    </ProfileTippy>
                  )}
                />

                {/* Therapy Type */}

                <Controller
                  name='therapy_types'
                  control={control}
                  render={({ field }) => (
                    <ProfileTippy
                      enable={checkIfFieldIsDisabled(
                        QUEUE_REQUEST_METADATA_FIELD_NAME.THERAPY_TYPE
                      )}
                      placement='top-start'
                    >
                      <CustomAsyncSelect
                        label={'Therapy Type'}
                        labelClassName='!text-base'
                        loadOptions={(page, searchTerm) =>
                          getFieldOptionsAsyncByTherapistId(
                            FieldOptionType.THERAPY_TYPE,
                            page,
                            searchTerm
                          )
                        }
                        queryKey={'therapy-type-options'}
                        pageSize={10}
                        onChange={field.onChange}
                        value={field.value}
                        name='therapy_types'
                        placeholder='Select Therapy Type'
                        error={errors.therapy_types && errors.therapy_types?.message}
                        isMulti
                        StylesConfig={{
                          control: () => ({
                            minHeight: '50px',
                            padding: '4px 6px',
                          }),
                          singleValue: () => ({
                            fontSize: '16px',
                          }),
                          option: () => ({
                            fontSize: '16px',
                          }),
                        }}
                        isRequired={checkIsRequiredField('therapy_types')}
                        isDisabled={checkIfFieldIsDisabled(
                          QUEUE_REQUEST_METADATA_FIELD_NAME.THERAPY_TYPE
                        )}
                      />
                    </ProfileTippy>
                  )}
                />

                {/* Preferences */}
                <div className='flex flex-col gap-2.5'>
                  <label className='text-blackdark text-base font-normal leading-5 whitespace-nowrap'>
                    Choose Your Preferences
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <div className='flex items-center gap-6'>
                    <ProfileTippy
                      enable={checkIfFieldIsDisabled(
                        QUEUE_REQUEST_METADATA_FIELD_NAME.SESSION_TYPE
                      )}
                      placement='right'
                    >
                      <CheckboxField
                        id='profile-checkbox-videoSessions'
                        label={SessionTypeLabelEnum.VIRTUAL}
                        register={register}
                        labelPlacement={'end'}
                        name='video_session'
                        labelClass='whitespace-nowrap'
                        isDisabled={checkIfFieldIsDisabled(
                          QUEUE_REQUEST_METADATA_FIELD_NAME.SESSION_TYPE
                        )}
                      />
                    </ProfileTippy>
                    <ProfileTippy
                      enable={checkIfFieldIsDisabled(
                        QUEUE_REQUEST_METADATA_FIELD_NAME.SESSION_TYPE
                      )}
                      placement='right'
                    >
                      <CheckboxField
                        id='profile-checkbox-atClinic'
                        label={SessionTypeLabelEnum.CLINIC}
                        labelPlacement={'end'}
                        name='clinic_session'
                        register={register}
                        labelClass='whitespace-nowrap'
                        onChange={e => {
                          if (!e.target.checked) {
                            setValue('clinic_address', null);
                          }
                          setTimeout(() => {
                            clearErrors('clinic_session');
                          }, 0);
                          trigger('video_session');
                        }}
                        isDisabled={checkIfFieldIsDisabled(
                          QUEUE_REQUEST_METADATA_FIELD_NAME.SESSION_TYPE
                        )}
                      />
                    </ProfileTippy>
                  </div>

                  {errors.clinic_session && (
                    <p className='text-xs text-red-500 mt-1.5'>{errors.clinic_session?.message}</p>
                  )}

                  {errors.video_session && !errors.clinic_session && (
                    <p className='text-xs text-red-500 mt-1.5'>{errors.video_session?.message}</p>
                  )}
                </div>

                {/* Clinic Addresses */}
                {watch('clinic_session') && (
                  <Controller
                    name='clinic_address'
                    control={control}
                    render={({ field }) => (
                      <ProfileTippy
                        enable={checkIfFieldIsDisabled(
                          QUEUE_REQUEST_METADATA_FIELD_NAME.CLINIC_ADDRESS
                        )}
                        placement='top-start'
                      >
                        <CustomAsyncSelect
                          label={'Clinic Addresses'}
                          labelClassName='!text-base'
                          loadOptions={(page, searchTerm) =>
                            getClinicAddressesListAsync(page, searchTerm)
                          }
                          queryKey={'clinic-address-options'}
                          pageSize={10}
                          onChange={field.onChange}
                          value={field.value}
                          name='clinic_address'
                          placeholder='Select Clinic Address'
                          isMulti
                          StylesConfig={{
                            control: () => ({
                              minHeight: '50px',
                              padding: '4px 6px',
                            }),
                            singleValue: () => ({
                              fontSize: '16px',
                            }),
                            option: () => ({
                              fontSize: '16px',
                            }),
                          }}
                          error={errors.clinic_address?.message}
                          isRequired={checkIsRequiredField('clinic_address')}
                          isDisabled={checkIfFieldIsDisabled(
                            QUEUE_REQUEST_METADATA_FIELD_NAME.CLINIC_ADDRESS
                          )}
                        />
                      </ProfileTippy>
                    )}
                  />
                )}

                {/* Personal Address */}

                <FormProvider {...methods}>
                  <TherapistAddress
                    checkIsRequiredField={checkIsRequiredField}
                    checkIfFieldIsDisabled={checkIfFieldIsDisabled}
                  />
                </FormProvider>

                {/* Bio */}

                <ProfileTippy
                  enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.BIO)}
                >
                  <TextArea
                    onChange={e => {
                      setValue('bio', e.target.value, { shouldValidate: true, shouldDirty: true });
                    }}
                    value={getValues('bio')}
                    name='bio'
                    rows={4}
                    placeholder='Enter your bio (max 3000 characters)'
                    error={errors.bio && errors.bio.message}
                    label='Bio'
                    labelClass='!text-base'
                    className='!text-base !leading-5 bg-white'
                    isRequired={checkIsRequiredField('bio')}
                    isDisabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.BIO)}
                  />
                </ProfileTippy>
              </div>
            </div>
            {/* Action Buttons */}
            <div className='flex gap-5 justify-end pt-30px mt-5 border-t border-solid border-surface'>
              <Button
                variant='outline'
                title='Cancel'
                className='!px-6 rounded-10px'
                type='button'
                onClick={() => {
                  if (isDirty) {
                    openCloseModal('discard', true);
                  } else {
                    onCancel();
                  }
                }}
              />
              <Button
                variant='filled'
                title='Save Changes'
                className='!px-6 rounded-10px'
                type='button'
                onClick={handleSubmit(onSubmit)}
                isLoading={isUpdateBasicDetailsApiPending || isCreateBasicDetailsApiPending}
                isDisabled={!isDirty}
              />
            </div>
            {/* </form> */}
          </div>
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
                        uploadProfilePic(selectedFile);
                      }
                      openCloseModal('fileUpload', false);
                    }
                  }}
                  accept={'image/*'}
                  className={''}
                  NumberOfFileAllowed={2}
                  isSubmitting={isUploadProfilePicLoading}
                  onFileRemove={() => clearErrors('profile_image')}
                />
                <p className='text-red'>{errors.profile_image?.message}</p>
              </>
            </Modal>
          )}
          {openModal.deleteProfile && (
            <DeleteModal
              isOpen={openModal.deleteProfile}
              onClose={() => openCloseModal('deleteProfile')}
              onSubmit={onDeleteProfilePic}
              isSubmitLoading={openModal.deleteProfile && isUpdateUserApiPending}
              message={`Are you sure you want to remove this profile image?`}
            />
          )}
          {openModal.discard && (
            <AlertModal
              isOpen={openModal.discard}
              onClose={() => openCloseModal('discard')}
              onSubmit={onCancel}
              alertMessage='Are you sure you want to cancel? Your changes will be lost.'
              title='Confirm Discard'
            />
          )}
        </>
      )}
    </>
  );
};
