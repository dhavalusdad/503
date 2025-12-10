import { useEffect } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useGetTreatmentProgressAnalytics } from '@/api/assessment-forms';
import Icon from '@/stories/Common/Icon';

type TPIChartProps = {
  client_id: string;
  therapist_id: string;
  setHighChartsValue: React.Dispatch<React.SetStateAction<Highcharts.Options | undefined>>;
  highCharts?: Highcharts.Options;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function TPIChart({
  client_id,
  therapist_id,
  setHighChartsValue,
  highCharts,
  setOpen,
}: TPIChartProps) {
  const { data, dataUpdatedAt } = useGetTreatmentProgressAnalytics({ client_id, therapist_id });

  const validColors = ['#FF6107', '#3A86FF', '#69306D', '#FFD166', '#7E57C2', '#A8A59B'];

  const frequencyLabels = [
    '',
    'Never', // 1
    'Rarely', // 2
    'Somedays', // 3
    'Most days', // 4
    'Everyday', // 5
  ];

  useEffect(() => {
    if (data?.data.dateRange) {
      const series = data?.data.series ?? {};
      setHighChartsValue({
        chart: {
          type: 'line',
          backgroundColor: '#fff',
          height: 300,
        },
        title: {
          text: '',
        },
        xAxis: {
          categories: data?.data.dateRange,
          gridLineWidth: 0,
          lineColor: '#E0E0E0',
          labels: {
            style: {
              fontSize: '10px',
              color: '#666666',
            },
          },
        },
        yAxis: {
          title: {
            text: '',
          },
          categories: frequencyLabels,
          gridLineDashStyle: 'Dash',
          gridLineColor: '#E0E0E0',
          min: 0,
          max: 5,

          tickInterval: 1,
          labels: {
            format: '{value:.1f}',
            style: {
              fontSize: '10px',
              color: '#666666',
            },
          },
        },
        legend: {
          align: 'left',
          verticalAlign: 'top',
          layout: 'horizontal',
          itemStyle: {
            fontSize: '10px',
            fontWeight: 'normal',
          },
        },
        plotOptions: {
          line: {
            marker: {
              enabled: true,
              radius: 4,
              symbol: 'circle',
            },
            lineWidth: 2,
          },
        },
        series:
          (Object.entries(series)
            ?.slice(0, 6)
            ?.map(([key, value], i) => {
              const color = validColors[i];
              return {
                name: key,
                type: 'line' as const,
                data: value as Highcharts.SeriesLineOptions['data'],
                color: color,
                marker: {
                  fillColor: color,
                },
              } as Highcharts.SeriesLineOptions;
            })
            .filter(Boolean) as Highcharts.SeriesOptionsType[]) || [],
      });
    }
  }, [dataUpdatedAt]);

  if (data?.data?.dateRange?.length < 1) {
    return null;
  }

  return (
    <>
      <p className='text-base font-normal text-blackdark leading-5'>
        Symptom progress last {data?.data.dateRange.length} Sessions
      </p>
      <div className=' relative w-full h-full bg-white rounded-10px border border-solid border-surface overflow-hidden'>
        <div
          onClick={() => setOpen(true)}
          className='absolute top-2 right-2 bg-surface/80 w-8 h-8 z-50 rounded-md flex justify-center items-center cursor-pointer'
        >
          <Icon name='ZoomIcon' />
        </div>
        <HighchartsReact highcharts={Highcharts} options={highCharts} />
      </div>
    </>
  );
}
