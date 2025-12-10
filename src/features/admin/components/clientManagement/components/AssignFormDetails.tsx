import { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { getAppointmentHistoryAsync, getDependentUserByClientId } from '@/api/appointment';
import { getAssessmentFormsAsync } from '@/api/assessment-forms';
import { formsQueryKey } from '@/api/common/assessment-form.queryKey';
import { selectStyles } from '@/constants/CommonConstant';
import { TherapyType } from '@/enums';
import { currentUser } from '@/redux/ducks/user';
import InputField from '@/stories/Common/Input';
import { CustomAsyncSelect } from '@/stories/Common/Select';

export interface AssignFormProps {
  clientId: string;
  selectedIds: {
    value: string;
    label: string;
  }[];
  appointmentIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
  setUserDependentIds: React.Dispatch<React.SetStateAction<string[]>>;
  setAppointmentIds: React.Dispatch<React.SetStateAction<string[]>>;
  userDependentIds: string[];
  clientData: { id?: string; first_name?: string; last_name?: string };
}

const AssignFormDetails = ({
  setSelectedIds,
  // appointmentIds,
  setUserDependentIds,
  setAppointmentIds,
  clientId,
  userDependentIds,
  clientData,
}: AssignFormProps) => {
  const { timezone } = useSelector(currentUser);

  type AppointmentOption = { value: string; label: string; data?: { therapy_name?: TherapyType } };
  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentOption[]>([]);
  const [assessmentError, setAssessmentError] = useState(false);

  const getAppointmentType = (appointmentDetail: AppointmentOption[] = []) => {
    if (!Array.isArray(appointmentDetail)) return [];

    const validTypes = [TherapyType.COUPLE, TherapyType.FAMILY, TherapyType.MINOR];
    const result: string[] = [];

    appointmentDetail.forEach(item => {
      const type = item?.data?.therapy_name as TherapyType | undefined;
      if (type && validTypes.includes(type) && !result.includes(type)) {
        result.push(type);
      }
    });

    return result;
  };

  useEffect(() => {
    return () => {
      setAppointmentDetail([]);
      setAppointmentIds([]);
      setSelectedIds([]);
    };
  }, []);

  useEffect(() => {
    if (appointmentDetail.length && getAppointmentType(appointmentDetail).length == 0) {
      setUserDependentIds({
        value: clientData?.id ?? '',
        label: `${clientData?.first_name} ${clientData?.last_name} (Main Client)`,
      });
    }
  }, [appointmentDetail.length]);

  return (
    <div className='flex flex-col gap-5'>
      <CustomAsyncSelect
        key={`assessment_form`}
        portalRootId='assign-assessment-form-modal'
        label='Assessment Forms'
        isClearable={true}
        labelClassName='!text-base'
        loadOptions={(page, searchTerm) => getAssessmentFormsAsync(page, 10, searchTerm)}
        placeholder='select Forms'
        queryKey={formsQueryKey.getList().filter(Boolean).map(String)}
        pageSize={10}
        onChange={value => {
          const selectedValues = value as { value: string; label: string }[];
          setSelectedIds?.(selectedValues);
          setAssessmentError(selectedValues.length === 0);
        }}
        isMulti
        StylesConfig={selectStyles}
        error={assessmentError ? 'Please select at least one assessment form.' : ''}
      />
      <CustomAsyncSelect
        key={`appointments-list-history-${clientId}`}
        portalRootId='assign-assessment-form-modal'
        label='Appointments'
        placeholder='select appointments'
        labelClassName='!text-base'
        isClearable={true}
        // isMulti={true}
        loadOptions={(page, searchTerm) =>
          getAppointmentHistoryAsync(timezone, page, searchTerm, clientId) as Promise<{
            data: { label: string; value: string }[];
            hasMore: boolean;
          }>
        }
        queryKey={[`appointments-list-history-${clientId}`]}
        pageSize={10}
        onChange={(value: { label: string; value: string }) => {
          setAppointmentDetail([value as { label: string; value: string }].filter(Boolean));
          setAppointmentIds?.([value?.value as string]);
        }}
        StylesConfig={selectStyles}
      />

      {appointmentDetail.length > 0 && getAppointmentType(appointmentDetail).length == 0 ? (
        <InputField
          type='text'
          title='Assign to'
          label='Assign to'
          labelClass='!text-base'
          value={`${clientData?.first_name} ${clientData?.last_name} (Main Client)`}
          className='pointer-events-none '
          required
        />
      ) : (
        <CustomAsyncSelect
          key={`${clientId}`}
          label='Assign to'
          isClearable={true}
          required
          AddOption={{
            value: clientData?.id ?? '',
            label: `${clientData?.first_name} ${clientData?.last_name} (Main Client)`,
          }}
          value={userDependentIds || null}
          placeholder={'Select  user'}
          labelClassName='!text-base !leading-5'
          loadOptions={(page, searchTerm) =>
            getDependentUserByClientId(
              page,
              searchTerm,
              clientId,
              getAppointmentType(appointmentDetail)
            )
          }
          queryKey={`${clientId}-${getAppointmentType(appointmentDetail).join('-')}`}
          pageSize={10}
          onChange={value => {
            setUserDependentIds(value);
          }}
          StylesConfig={{
            control: () => ({ minHeight: '50px', padding: '4px 6px', fontSize: '16px' }),
            singleValue: () => ({ fontSize: '16px' }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
          // isMulti
          portalRootId='assign-assessment-form-modal'
        />
      )}
    </div>
  );
};

export default AssignFormDetails;
