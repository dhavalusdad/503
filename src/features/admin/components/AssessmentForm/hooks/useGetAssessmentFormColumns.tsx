import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useUpdateFormCategory } from '@/api/assessment-forms';
import { FORM_CATEGORY_OPTIONS } from '@/constants/CommonConstant';
import { ROUTES } from '@/constants/routePath';
// import { ROUTES_BASE_PATH } from '@/constants/route  PathConstant';
import { PermissionType } from '@/enums';
import type { AssessmentFormDataType } from '@/features/admin/components/AssessmentForm/type';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import RowDropdown from '@/stories/Common/RowDropdown';
import Select from '@/stories/Common/Select';

import type { ColumnDef } from '@tanstack/react-table';

const useGetAssessmentFormListColumns = (
  therapistPanel: boolean,
  selectedForms: { id: string; name: string }[],
  setSelectedForms: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>
) => {
  const { timezone } = useSelector(currentUser);
  const { mutateAsync: updateStatus } = useUpdateFormCategory();

  const navigate = useNavigate();
  const { hasPermission } = useRoleBasedRouting();
  const handleCheckboxChange = (id: string, name: string, checked: boolean) => {
    setSelectedForms(
      prev =>
        checked
          ? [...prev, { id, name }] // add both id + name
          : prev.filter(item => item.id !== id) // remove by id
    );
  };

  const handleChange = async (category: string, id: string) => {
    try {
      updateStatus({
        data: { category },
        id: id,
      });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const baseColumns: ColumnDef<AssessmentFormDataType>[] = [
    {
      accessorKey: 'name',
      accessorFn: row => `${row.name}`,
      header: 'Form Title',
      meta: {
        cellClassName: '!whitespace-normal min-w-3xs',
      },
      cell: ({ row }) => {
        return (
          <span
            className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
            onClick={() => navigate(ROUTES.EDIT_ASSESSMENT_FORM.navigatePath(row.original.id))}
          >
            {row.getValue('name')}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created Date',
      cell: ({ row }) => {
        const time = row.original?.created_at;
        return (
          <div className='flex gap-2'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'} ,</span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated Date',
      cell: ({ row }) => {
        const time = row.original?.updated_at;
        return (
          <div className='flex gap-2'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'} ,</span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        const canEdit = hasPermission(PermissionType.ASSESSMENT_FORM_EDIT);
        return (
          <Select
            key={`gender`}
            labelClassName='!text-base'
            placeholder='Select Category'
            isClearable={false}
            value={FORM_CATEGORY_OPTIONS.find(opt => opt.value == row.original.form_category)}
            options={FORM_CATEGORY_OPTIONS}
            onChange={value => {
              if (canEdit && value) {
                handleChange(value.value as string, row.original.id);
              }
            }}
            isDisabled={!canEdit}
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
                padding: '4px 10px',
                minWidth: '180px',
              }),
              input: () => ({
                fontSize: '16px',
              }),
              singleValue: () => ({
                fontSize: '16px',
                width: 'auto',
              }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
            // portalRootId='assessment-list'
            menuPortalTarget={document.body}
          />
        );
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        return (
          <RowDropdown<HTMLDivElement>
            content={() => (
              <ul className='flex flex-col min-w-32'>
                {/* <li
                  className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                  onClick={() => {
                    navigate(ROUTES.EDIT_ASSESSMENT_FORM.navigatePath(row.original.id));
                  }}
                >
                  <Icon name='eye' className={`w-5 h-5 text-gray-700'}`} />
                  <span className='text-sm font-normal leading-18px text-blackdark'>View</span>
                </li> */}
                <li
                  className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-2.5'
                  onClick={() => {
                    navigate(ROUTES.EDIT_ASSESSMENT_FORM.navigatePath(row.original.id));
                  }}
                >
                  <Icon name='eye' className={`w-5 h-5 text-blackdark`} />
                  <span className='text-sm font-normal leading-18px text-blackdark'>View</span>
                </li>
              </ul>
            )}
            placement='auto'
          >
            {({ onToggle, targetRef }) => (
              <div
                ref={targetRef}
                onClick={() => onToggle()}
                className='cursor-pointer inline-block py-2'
              >
                <Icon name='threedots' className='text-blackdark' />
              </div>
            )}
          </RowDropdown>
        );
      },
    },
  ];
  const checkboxColumn: ColumnDef<AssessmentFormDataType>[] = [
    {
      id: 'select',
      header: () => <span>Select</span>, // could use a master checkbox here
      cell: ({ row }) => (
        <CheckboxField
          id={row.original.id}
          isChecked={selectedForms.some(item => item.id === row.original.id)}
          onChange={e => handleCheckboxChange(row.original.id, row.original.name, e.target.checked)}
        />
      ),
    },
    {
      accessorKey: 'name',
      accessorFn: row => `${row.name}`,
      header: 'Form Title',
      cell: ({ row }) => {
        return <>{`${row.getValue('name')}`}</>;
      },
    },
  ];
  const columns = therapistPanel ? checkboxColumn : baseColumns;

  return { columns };
};

export default useGetAssessmentFormListColumns;
