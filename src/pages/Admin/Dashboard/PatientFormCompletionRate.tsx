import { useMemo } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useGetPatientFormCompletionRate } from '@/api/admin-dashboard';

const completedLabel = 'Completed';
const incompleteLabel = 'Incomplete';
const completedColor = '#08A045';
const incompleteColor = '#FF513F';

const PatientFormCompletionRate = () => {
  // ** Services **
  const { data, isLoading, dataUpdatedAt } = useGetPatientFormCompletionRate();

  // ** Memo **
  const completedPercentage = useMemo(() => {
    if (!data) return 0;
    return data.completed || 0;
  }, [dataUpdatedAt]);

  const incompletePercentage = useMemo(() => {
    return 100 - completedPercentage;
  }, [completedPercentage]);

  const options: Highcharts.Options = useMemo(() => {
    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: '100%',
        width: 300,
        spacing: [10, 10, 10, 10],
      },
      title: {
        text: '',
      },
      plotOptions: {
        pie: {
          innerSize: '70%',
          dataLabels: { enabled: false },
          borderWidth: 0,
          colors: [completedColor, incompleteColor],
          startAngle: 0,
        },
      },
      tooltip: { enabled: false },
      credits: { enabled: false },
      legend: { enabled: false },
      series: [
        {
          type: 'pie',
          name: 'Forms',
          data: [
            {
              name: completedLabel,
              y: completedPercentage > 0 ? completedPercentage : 0.0001,
              color: completedColor,
            },
            {
              name: incompleteLabel,
              y: incompletePercentage > 0 ? incompletePercentage : 0.0001,
              color: incompleteColor,
            },
          ],
        },
      ],
    };
  }, [completedPercentage, incompletePercentage]);

  return (
    <div className='bg-white p-5 rounded-20px shadow-cardshadow'>
      <h2 className='text-lg font-bold leading-6 text-blackdark mb-4'>Form Completion Rate</h2>
      {isLoading ? (
        <div className='flex justify-center items-center py-4'>
          <span
            className={`relative border-[5px] border-lime-500 border-b-lime-300 rounded-full block animate-spin h-5 w-5`}
          />
        </div>
      ) : (
        <>
          <div className='flex justify-center'>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <div className='flex flex-col justify-center ml-6 gap-3'>
              <div className='flex items-center text-lg text-blackdark'>
                <span
                  className='w-3 h-3 rounded-full mr-2'
                  style={{ backgroundColor: '#08A045' }}
                ></span>
                {completedLabel}
              </div>
              <div className='flex items-center text-lg text-blackdark'>
                <span
                  className='w-3 h-3 rounded-full mr-2'
                  style={{ backgroundColor: '#FF513F' }}
                ></span>
                {incompleteLabel}
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-blackdark text-lg font-semibold'>{completedLabel}</span>
              <span className='font-bold text-lg' style={{ color: completedColor }}>
                {completedPercentage}%
              </span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-blackdark text-lg font-semibold'>{incompleteLabel}</span>
              <span className='font-bold text-lg' style={{ color: incompleteColor }}>
                {incompletePercentage}%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientFormCompletionRate;
