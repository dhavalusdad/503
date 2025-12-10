import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { useGetTherapistSessionEngagementData } from '@/api/therapist';

const KEYS = {
  LESS: 'less',
  MEDIUM: 'medium',
  MORE: 'more',
  TOO_MUCH: 'tooMuch',
  LONG_TERM: 'longTerm',
};

const KEY_LABELS = {
  [KEYS.LESS]: { label: '11 & Below Sessions', color: '#14B8A6' },
  [KEYS.MEDIUM]: { label: '12 - 17 Sessions', color: '#FACC15' },
  [KEYS.MORE]: { label: '18 - 24 Sessions', color: '#F59E0B' },
  [KEYS.TOO_MUCH]: { label: '25 & Above Sessions', color: '#FF513F' },
  [KEYS.LONG_TERM]: { label: 'Long Term Clients', color: '#AC87C5' },
};
export const SessionProgressPieChart = () => {
  const { data, isFetching } = useGetTherapistSessionEngagementData();

  const totalClients = data?.total_clients ?? 0;

  // Raw counts
  const counts: Record<string, number> = data?.client_appointments ?? {};

  // Calculate percentages
  const obj = Object.fromEntries(
    Object.entries(counts).map(([key, value]) => [key, (value / totalClients) * 100])
  );

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
    },
    credits: {
      enabled: false,
    },
    title: { text: '' },
    plotOptions: {
      pie: {
        showInLegend: true,
        dataLabels: { enabled: false },
      },
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      width: 420,
      itemWidth: 210,
      symbolRadius: 9999,
      symbolHeight: 14,
      symbolWidth: 14,
      itemStyle: {
        fontSize: '16px',
        fontWeight: '400',
        color: '#2E3139',
      },
      itemMarginTop: 10,
      itemMarginBottom: 10,
    },
    tooltip: {
      formatter: function () {
        const point = this as Highcharts.Point & { clients: number };
        const percentage = Math.round(point.percentage ?? 0);

        return `
          <b>${point.name}</b><br/>
          Clients: ${point.clients}<br/>
          Percentage: ${percentage}%
        `;
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Sessions',
        data: [
          {
            name: KEY_LABELS[KEYS.LESS].label,
            y: obj?.[KEYS.LESS] || null,
            color: KEY_LABELS[KEYS.LESS].color,
            clients: counts?.[KEYS.LESS],
          },
          {
            name: KEY_LABELS[KEYS.MEDIUM].label,
            y: obj?.[KEYS.MEDIUM] || null,
            color: KEY_LABELS[KEYS.MEDIUM].color,
            clients: counts?.[KEYS.MEDIUM],
          },
          {
            name: KEY_LABELS[KEYS.MORE].label,
            y: obj?.[KEYS.MORE] || null,
            color: KEY_LABELS[KEYS.MORE].color,
            clients: counts?.[KEYS.MORE],
          },
          {
            name: KEY_LABELS[KEYS.TOO_MUCH].label,
            y: obj?.[KEYS.TOO_MUCH] || null,
            color: KEY_LABELS[KEYS.TOO_MUCH].color,
            clients: counts?.[KEYS.TOO_MUCH],
          },
          {
            name: KEY_LABELS[KEYS.LONG_TERM].label,
            y: obj?.[KEYS.LONG_TERM] || null,
            color: KEY_LABELS[KEYS.LONG_TERM].color,
            clients: counts?.[KEYS.LONG_TERM],
          },
        ] as (Highcharts.PointOptionsObject & { clients: number })[],
      },
    ],
  };

  return (
    <div className='bg-white p-5 shadow-progresstracker rounded-2xl relative min-h-[420px]'>
      <h2 className='text-lg font-bold mb-5 text-blackdark'>Session Engagement & Progress</h2>
      {isFetching ? (
        <div className='flex absolute top-0 left-0 w-full justify-center items-center h-full'>
          <span
            className={`inline-block border-2 border-lime-200 border-b-lime-500 rounded-full animate-spin h-7 w-7`}
          />
        </div>
      ) : (
        <div className='w-full min-h-80'>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      )}
    </div>
  );
};
