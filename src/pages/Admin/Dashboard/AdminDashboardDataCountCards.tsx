import { useMemo } from 'react';

import { useGetDashboardData } from '@/api/admin-dashboard';
import { isDefined } from '@/api/utils';
import { Icon, type IconNameType } from '@/stories/Common/Icon';

type CountDataType = {
  iconName: IconNameType;
  label: string;
  count: number;
  sort: number;
};
const getComponent = (params: CountDataType) => {
  const { iconName, label, count } = params;
  return (
    <div className='bg-white p-5 rounded-20px shadow-cardshadow' key={label}>
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary text-white w-50px h-50px rounded-full flex items-center justify-center'>
            <Icon name={iconName} />
          </div>
          <p className='text-base font-semibold leading-5 text-blackdark flex-1'>{label}</p>
        </div>
        <h2 className='text-32px font-bold text-primary leading-44px'>{count}</h2>
      </div>
    </div>
  );
};

const AdminDashboardDataCountCards = () => {
  const { data: dashboardData, isLoading } = useGetDashboardData({});

  const data = useMemo(() => {
    const arr: CountDataType[] = [];
    if (isDefined(dashboardData?.clients)) {
      arr.push({
        iconName: 'doubleUser',
        label: 'Clients',
        count: dashboardData?.clients as number,
        sort: 1,
      });
    }

    if (isDefined(dashboardData?.appointments)) {
      arr.push(
        {
          iconName: 'calendar',
          label: 'Appointments',
          count: dashboardData?.appointments as number,
          sort: 2,
        },
        {
          iconName: 'clinicaddress',
          label: 'Clinical sessions',
          count: dashboardData?.clinical_sessions as number,
          sort: 4,
        },
        {
          iconName: 'video',
          label: 'Video sessions',
          count: dashboardData?.video_sessions as number,
          sort: 5,
        }
      );
    }

    if (isDefined(dashboardData?.therapists)) {
      arr.push({
        iconName: 'therapist',
        label: 'Therapists',
        count: dashboardData?.therapists as number,
        sort: 3,
      });
    }

    return arr.sort((a, b) => a.sort - b.sort);
  }, [dashboardData]);
  return (
    <>
      {isLoading ? (
        <div className='flex justify-center items-center w-full'>
          <span
            className={`relative border-[5px] border-primary border-b-primarylight rounded-full block animate-spin h-5 w-5`}
          />
        </div>
      ) : (
        <div className='grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
          {data.map(card => getComponent(card))}
        </div>
      )}
    </>
  );
};

export default AdminDashboardDataCountCards;
