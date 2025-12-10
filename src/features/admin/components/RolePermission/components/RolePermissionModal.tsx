import React, { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import RadioField from '@/stories/Common/RadioBox';

import type {
  PermissionType,
  RoleFormData,
  RoleSubmitData,
} from '@features/admin/components/RolePermission/type/index';

export type DefaultValueType = {
  name?: string;
  permissions: {
    selected: string[];
    notSelected: string[];
  };
  readOnly?: boolean;
  isAssignFormToPatient?: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleSubmitData) => void;
  defaultValues?: DefaultValueType;
  isEditing?: boolean;
  roleId?: string | number;
  permissionList: PermissionType[];
};

export const roleFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Role name is required')
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must be at most 50 characters'),
  permissions: yup.object({
    selected: yup.array(yup.string().defined()).required(),
    notSelected: yup.array(yup.string().defined()).required(),
  }),
  assignForm: yup.boolean().required(),
});

const labelMap: Record<string, string> = {
  FORMS: 'Add Forms',
  APPOINTMENT: 'Appointments',
  PATIENT: 'Add Patient',
  THERAPIST: 'Add Therapist',
  AGREEMENTS: 'Agreements',
  ASSIGN: 'Assign Form to Patient',
};

export const RolePermissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isEditing = false,
  roleId,
  permissionList,
}) => {
  const {
    handleSubmit,
    setValue,
    reset,
    register,
    getValues,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: yupResolver(roleFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      permissions: { selected: [], notSelected: [] },
      assignForm: false,
    },
  });

  const [permissionGroups, setPermissionGroups] = useState<Record<string, PermissionType[]>>({});
  const isView = defaultValues?.readOnly;

  useEffect(() => {
    const grouped = permissionList.reduce(
      (acc, permission) => {
        const base = permission.name.substring(0, permission.name.lastIndexOf('_PERMISSION_'));
        (acc[base] ||= []).push(permission);
        return acc;
      },
      {} as Record<string, PermissionType[]>
    );

    setPermissionGroups(grouped);
  }, [permissionList]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && defaultValues) {
      reset({
        name: defaultValues.name || '',
        permissions: defaultValues.permissions,
        assignForm: defaultValues.isAssignFormToPatient || false,
      });
    } else {
      reset({
        name: '',
        permissions: { selected: [], notSelected: [] },
        assignForm: false,
      });
    }
  }, [isOpen, isEditing, defaultValues, permissionList, reset]);

  const watchedPermissions = getValues('permissions');

  const handleCheckboxChange = (checked: boolean, value: string, groupName: string) => {
    const selSet = new Set(watchedPermissions.selected);
    const notSelSet = new Set(watchedPermissions.notSelected);

    const groupPermissions = permissionGroups[groupName];
    if (!groupPermissions) return;

    const readPermission = groupPermissions.find(p => p.name.endsWith('READ'))?.id;

    if (checked) {
      selSet.add(value);
      notSelSet.delete(value);

      if (readPermission && value !== readPermission) {
        selSet.add(readPermission);
        notSelSet.delete(readPermission);
      }
    } else {
      selSet.delete(value);
      notSelSet.add(value);

      if (readPermission && value === readPermission) {
        groupPermissions.forEach(p => {
          selSet.delete(p.id);
          notSelSet.add(p.id);
        });
      }
    }

    setValue(
      'permissions',
      {
        selected: Array.from(selSet),
        notSelected: Array.from(notSelSet),
      },
      { shouldValidate: true }
    );
  };

  const handleAssignFormChange = (isAllow: boolean, permissionId: string) => {
    setValue('assignForm', isAllow, { shouldValidate: true });

    const selSet = new Set(watchedPermissions.selected);
    const notSelSet = new Set(watchedPermissions.notSelected);

    if (isAllow) {
      selSet.add(permissionId);
      notSelSet.delete(permissionId);
    } else {
      selSet.delete(permissionId);
      notSelSet.add(permissionId);
    }

    setValue(
      'permissions',
      {
        selected: Array.from(selSet),
        notSelected: Array.from(notSelSet),
      },
      { shouldValidate: true }
    );
  };

  const onFormSubmit = (data: RoleFormData) => {
    const submitData: RoleSubmitData = {
      name: data.name.trim(),
      permissions: data.permissions,
      isEditing,
      ...(isEditing && roleId ? { id: roleId } : {}),
      assignForm: data.assignForm,
    };

    onSubmit(submitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      footer={
        <>
          <Button
            title={isView ? 'Close' : 'Cancel'}
            variant='outline'
            type='button'
            onClick={onClose}
            className='!px-6 rounded-10px'
          />
          {!isView && (
            <Button
              title={isEditing ? 'Update' : 'Submit'}
              variant='filled'
              type='button'
              onClick={handleSubmit(onFormSubmit)}
              className='!px-6 rounded-10px'
            />
          )}
        </>
      }
      footerClassName='flex items-center justify-end gap-5 pt-30px border-t border-solid border-surface'
      title={`${isView ? 'View' : isEditing ? 'Edit' : 'Create'} Role`}
      isOpen={isOpen}
      onClose={onClose}
      size='lg'
      closeButton={false}
    >
      <div className='flex flex-col gap-5'>
        <InputField
          isDisabled={isView}
          type='text'
          className='font-medium'
          label='Role Name'
          name='name'
          isRequired
          labelClass='!text-base !leading-5'
          inputClass='!text-base !leading-5'
          placeholder='Enter Role Name'
          register={register}
          error={errors?.name?.message}
        />

        <div className='flex flex-col gap-2.5'>
          {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => (
            <div
              key={groupName}
              className='flex items-center gap-5 bg-surfacelight border border-surface rounded-10px p-5'
            >
              <h6 className='text-base font-bold text-blackdark w-32'>
                {labelMap[groupName] || groupPermissions[0].label}
              </h6>
              <div className='flex flex-wrap gap-5 w-[calc(100%-148px)]'>
                {groupPermissions.map(perm => {
                  const isChecked = watchedPermissions.selected?.includes(perm.id);

                  if (perm.name === 'ASSIGN_FORM_TO_PATIENT_PERMISSION_UPDATE') {
                    return (
                      <div key={perm.id} className='flex items-center gap-5'>
                        <div key={perm.id} className='w-24'>
                          <RadioField
                            id={`${perm.id}_allow`}
                            name='assignForm'
                            value='true'
                            label='Allow'
                            isChecked={getValues('assignForm') === true}
                            onChange={() => handleAssignFormChange(true, perm.id)}
                            isDisabled={isView}
                          />
                        </div>
                        <div key={perm.id} className='w-24'>
                          <RadioField
                            id={`${perm.id}_deny`}
                            name='assignForm'
                            value='false'
                            label='Deny'
                            isChecked={getValues('assignForm') === false}
                            onChange={() => handleAssignFormChange(false, perm.id)}
                            isDisabled={isView}
                          />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={perm.id} className='w-24'>
                      <CheckboxField
                        isDisabled={isView}
                        id={perm.id}
                        value={perm.id}
                        isChecked={isChecked}
                        onChange={e =>
                          handleCheckboxChange(e.target.checked, e.target.value, groupName)
                        }
                        label={perm.name.replace(/^.*_PERMISSION_/, '').replaceAll('_', ' ')}
                        labelClass='!text-base !leading-4 font-semibold'
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
