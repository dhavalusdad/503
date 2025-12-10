import { useEffect, useMemo, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useCreateStaffMember,
  useGetStaffById,
  useInfiniteRolesQuery,
  useUpdateStaffMember,
} from '@/api/staff';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { addStaffMemberSchema } from '@/features/staff/validationSchema';
import type { AddStaffMemberFormData, ModalType } from '@/pages/Admin/StaffManagement/types';
import { currentUser } from '@/redux/ducks/user';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select from '@/stories/Common/Select';

const AddNewStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ** Refs **
  const oldValuesRef = useRef<AddStaffMemberFormData | undefined>(null);

  // ** Vars **
  const currentUserData = useSelector(currentUser);
  const { role } = currentUserData;
  const isAdmin = role === UserRole.ADMIN;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    getValues,
    reset,
  } = useForm<AddStaffMemberFormData>({
    resolver: yupResolver(addStaffMemberSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
    },
  });

  const { mutateAsync: createStaffMember, isPending: isCreateStaffMemberApiPending } =
    useCreateStaffMember({});

  const { mutateAsync: updateStaffMember } = useUpdateStaffMember({ staff_id: id });

  const { data: getStaffMemberDetails } = useGetStaffById({
    staff_id: id,
    options: {
      enabled: !!id,
    },
  });

  const [searchRole, setSearchRole] = useState('');

  const [openModal, setOpenModal] = useState<ModalType>({
    discard: false,
  });

  const {
    data: infiniteRolesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingRoles,
  } = useInfiniteRolesQuery({
    limit: 10,
    roleName: searchRole,
  });

  const allRoles = useMemo(() => {
    if (!infiniteRolesData?.pages) return [];
    return infiniteRolesData.pages.flatMap(page => page.roles);
  }, [infiniteRolesData]);

  const roleOptions = useMemo(() => {
    return allRoles.map(role => ({
      label: role?.name,
      value: role?.id,
    }));
  }, [allRoles]);

  useEffect(() => {
    if (id && getStaffMemberDetails && allRoles.length > 0) {
      const { email, first_name, last_name, phone, roles } = getStaffMemberDetails;
      const userRoleId = roles?.[0]?.UserRole?.role_id as string;
      const obj = {
        email,
        first_name,
        last_name,
        phone,
        role: userRoleId || '',
      };
      oldValuesRef.current = obj;
      reset(obj);
    }
  }, [id, getStaffMemberDetails, allRoles, reset]);

  const openCloseModal = (modalName: keyof ModalType, actionBool: boolean) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
    }));
  };

  const onCancel = () => {
    if (isAdmin) {
      navigate(ROUTES.STAFF_MANAGEMENT.path);
    } else {
      navigate(ROUTES.ADMIN_DASHBOARD.path);
    }
  };

  // *** Helpers ***
  const createOrUpdateStaffMember = async () => {
    const vals = getValues();
    const { first_name, last_name, phone, email, role } = vals;
    const payload = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      role,
    };

    if (id) {
      const getChangedProps = <T extends object>(obj1: T, obj2: T): Partial<T> => {
        return _.pickBy(obj2, (value, key) => !_.isEqual(value, obj1[key as keyof T]));
      };
      const reducedObj = getChangedProps(oldValuesRef.current, payload);
      delete reducedObj['role'];
      await updateStaffMember({ ...reducedObj, role_id: role });
    } else {
      const selectedRole = allRoles.find(r => r.id === role);
      const roleSlug = selectedRole?.slug;
      await createStaffMember({
        first_name,
        last_name,
        phone,
        email,
        role: roleSlug,
        role_id: role,
      });
    }
    navigate(ROUTES.STAFF_MANAGEMENT.path);
  };

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex flex-col gap-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>{`${id ? 'Update' : 'Add'} Staff Member`}</h5>
        <div className='grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
          <InputField
            name='first_name'
            register={register}
            type='first_name'
            label='First Name'
            placeholder='First Name'
            isRequired={true}
            labelClass='!text-base !leading-5'
            inputClass='!text-base !leading-5'
            error={errors.first_name?.message}
          />
          <InputField
            name='last_name'
            register={register}
            type='last_name'
            label='Last Name'
            placeholder='Last Name'
            isRequired={true}
            labelClass='!text-base !leading-5'
            inputClass='!text-base !leading-5'
            error={errors.last_name?.message}
          />
          <PhoneField
            value={getValues('phone')}
            onChange={formattedValue => {
              setValue('phone', formattedValue, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            label={'Contact Number'}
            labelClass='!text-base !leading-5'
            isRequired={true}
            inputClass={`!text-base !leading-5 ${errors.phone && errors.phone.message ? 'border-red-500' : ''} `}
            country='us'
            enableSearch={true}
            error={errors.phone && errors.phone.message}
            isReadOnly={false}
            isModal={false}
          />
        </div>
        <div className='grid md:grid-cols-2 grid-cols-1 gap-5'>
          <InputField
            name='email'
            register={register}
            type='email'
            label='Email'
            placeholder='Email'
            labelClass='!text-base !leading-5'
            inputClass='!text-base !leading-5'
            icon='email'
            isRequired={true}
            iconFirst
            error={errors.email?.message}
            autoComplete='email'
          />
          <Select
            label='Select Role'
            options={roleOptions}
            value={roleOptions.find(option => option.value === getValues('role'))}
            onChange={value =>
              setValue(
                'role',
                String((value as { label: string; value: string | number })?.value),
                {
                  shouldValidate: true,
                  shouldDirty: true,
                }
              )
            }
            placeholder='Select Role'
            error={errors.role?.message}
            labelClassName='!text-base !leading-5'
            isLoading={isLoadingRoles}
            onMenuScrollToBottom={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onInputChange={(newValue: string) => {
              setSearchRole(newValue);
            }}
            isRequired={true}
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
          />
        </div>
        <div className='flex items-center gap-5 justify-end pt-30px border-t border-solid border-surface'>
          <Button
            variant='outline'
            title='Cancel'
            className='!px-6 rounded-10px'
            onClick={() => {
              if (isDirty) {
                openCloseModal('discard', true);
              } else {
                navigate(ROUTES.STAFF_MANAGEMENT.path);
              }
            }}
          />
          <Button
            variant='filled'
            title={`${id ? 'Update' : 'Add'} Now`}
            className='!px-6 rounded-10px'
            isDisabled={id ? !isDirty : false}
            onClick={handleSubmit(createOrUpdateStaffMember)}
            isLoading={isCreateStaffMemberApiPending}
          />
        </div>
      </div>
      {openModal.discard && (
        <AlertModal
          isOpen={openModal.discard}
          onClose={() => openCloseModal('discard', false)}
          onSubmit={onCancel}
          alertMessage='If you cancel, your changes will be lost. Are you sure you want to proceed?'
          title='Confirm Discard'
        />
      )}
    </div>
  );
};

export default AddNewStaff;
