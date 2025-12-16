import React, { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { useGetAllPermissions } from '@/api/permissions';
import { useCreateRole, useGetPermissionsByRoleId, useUpdateRole } from '@/api/roles-permissions';
import { DEPENDENT_PERMISSIONS } from '@/constants/permission.constant';
import { PermissionType } from '@/enums';
import type { RoleFormData } from '@/features/admin/components/RolePermission/type/index';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import RadioField from '@/stories/Common/RadioBox';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  roleId?: string;
  isView: boolean;
};
export const roleFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Role name is required')
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must be at most 50 characters'),

  permissions: yup
    .array()
    .of(yup.string().defined())
    .required('Permissions are required')
    .min(1, 'At least one permission must be selected'),
});

const labelMap: Record<string, string> = {
  FORMS: 'Assessment Forms',
  APPOINTMENT: 'Appointments',
  PATIENT: 'Patient',
  THERAPIST: 'Therapist',
  AGREEMENTS: 'Agreements',
  ASSIGN: 'Assign Form to Patient',
};

export const RolePermissionModal: React.FC<Props> = ({ isOpen, onClose, roleId, isView }) => {
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();
  const { data: roleData, isPending: isRoleDataFetching } = useGetPermissionsByRoleId(roleId);
  const { data: permissionData, isPending: isPermissionDataFetching } = useGetAllPermissions();

  const {
    handleSubmit,
    setValue,
    register,
    getValues,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    resolver: yupResolver(roleFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      permissions: [],
    },
  });
  const watchedPermissions = getValues('permissions');

  const [permissionGroups, setPermissionGroups] = useState<Record<string, RolePermissionType[]>>(
    {}
  );

  const addPermissionRecursively = (permissionName: string, selected: string[]) => {
    if (selected.includes(permissionName)) return;
    selected.push(permissionName);
    const allowedPermissions = DEPENDENT_PERMISSIONS[permissionName]?.allow || [];
    allowedPermissions.forEach(allowedPerm => {
      addPermissionRecursively(allowedPerm, selected);
    });
  };

  const collectPermissionsToDeny = (
    permissionName: string,
    denySet: Set<string>,
    visited: Set<string>
  ) => {
    if (visited.has(permissionName)) return;
    visited.add(permissionName);

    // 1. Add the permission itself
    denySet.add(permissionName);

    const config = DEPENDENT_PERMISSIONS[permissionName];

    // 2. Add its own deny list
    if (config?.deny) {
      config.deny.forEach(p => {
        collectPermissionsToDeny(p, denySet, visited);
      });
    }

    // 3. Find reverse dependencies: anyone whose allow contains current permission
    Object.entries(DEPENDENT_PERMISSIONS).forEach(([key, { allow = [], deny = [] }]) => {
      if (allow.includes(permissionName as PermissionType)) {
        // deny the key itself
        collectPermissionsToDeny(key, denySet, visited);

        // deny its deny list
        deny.forEach(p => collectPermissionsToDeny(p, denySet, visited));
      }
    });
  };

  const handleCheckboxChange = (checked: boolean, permissionName: string) => {
    let selected = [...watchedPermissions];

    if (checked) {
      addPermissionRecursively(permissionName, selected);
    } else {
      const denySet = new Set<string>();
      const visited = new Set<string>();

      collectPermissionsToDeny(permissionName, denySet, visited);

      selected = selected.filter(s => !denySet.has(s));
    }

    setValue('permissions', _.uniq(selected), { shouldValidate: true });
  };

  const onFormSubmit = async (data: RoleFormData) => {
    const submitData = {
      roleName: data.name.trim(),
      permissions: permissionData.filter(p => watchedPermissions.includes(p.name)).map(f => f.id),
    };

    if (roleId) {
      await updateRole({ id: roleId, data: submitData });
    } else {
      await createRole(submitData);
    }
    reset();
    onClose();
  };

  if (!isOpen) return null;

  useEffect(() => {
    if (isPermissionDataFetching) return;
    const grouped = permissionData?.reduce(
      (acc, permission) => {
        const base = permission.name.substring(0, permission.name.lastIndexOf('_PERMISSION_'));
        (acc[base] ||= []).push(permission);
        return acc;
      },
      {} as Record<string, PermissionType[]>
    );
    setPermissionGroups(grouped);
  }, [permissionData, isPermissionDataFetching]);

  useEffect(() => {
    if (isRoleDataFetching) return;
    reset({
      name: roleData.name,
      permissions: roleData.permissions.map(i => i.name),
    });
  }, [roleData, isRoleDataFetching]);

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
              title={roleId ? 'Update' : 'Submit'}
              variant='filled'
              type='button'
              onClick={handleSubmit(onFormSubmit)}
              className='!px-6 rounded-10px'
              isLoading={isCreating || isUpdating}
            />
          )}
        </>
      }
      footerClassName='flex items-center justify-end gap-5 pt-30px border-t border-solid border-surface'
      title={`${isView ? 'View' : roleId ? 'Edit' : 'Create'} Role`}
      isOpen={isOpen}
      onClose={onClose}
      size='lg'
      closeButton={false}
      isLoading={(roleId && isRoleDataFetching) || isPermissionDataFetching}
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
                  const isChecked = watchedPermissions?.includes(perm.name);

                  if (perm.name === PermissionType.PATIENT_ASSIGN_FORM) {
                    return (
                      <div key={perm.id} className='flex items-center gap-5'>
                        <div key={`${perm.id}_allow`} className='w-24'>
                          <RadioField
                            id={`${perm.id}_allow`}
                            name='assignForm'
                            value='true'
                            label='Allow'
                            isChecked={watchedPermissions.includes(perm.name)}
                            onChange={() => handleCheckboxChange(true, perm.name)}
                            isDisabled={isView}
                          />
                        </div>
                        <div key={`${perm.id}_deny`} className='w-24'>
                          <RadioField
                            id={`${perm.id}_deny`}
                            name='assignForm'
                            value='false'
                            label='Deny'
                            isChecked={!watchedPermissions.includes(perm.name)}
                            onChange={() => handleCheckboxChange(false, perm.name)}
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
                        onChange={e => handleCheckboxChange(e.target.checked, perm.name)}
                        label={perm.name.replace(/^.*_PERMISSION_/, '').replaceAll('_', ' ')}
                        labelClass='!text-base !leading-4 font-semibold'
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {errors.permissions && (
            <p className={clsx('text-xs text-red-500 mt-1.5')}>{errors.permissions.message}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
