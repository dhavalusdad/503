import React, { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export interface ColumnsChartsProps {
  xAxis?: string[];
  yAxis?: { col1?: number[]; col2?: number[] };
  col1Name?: string;
  col2Name?: string;
  legend?: { align?: string; verticalAlign?: string };
  plotOptions?: {
    column?: {
      borderRadius?: number;
      dataLabels?: { enabled?: boolean };
    };
  };
}

const ColumnCharts: React.FC<ColumnsChartsProps> = ({
  xAxis = [],
  yAxis = { col1: [], col2: [] },
  col1Name = 'Self Pay',
  col2Name = 'Insurance Pay',
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const [selectedSeries, setSelectedSeries] = useState<'both' | 'col1' | 'col2'>('both');

  const getSeries = (): Highcharts.SeriesOptionsType[] => {
    const safeCol1 = Array.isArray(yAxis?.col1) ? yAxis.col1 : [];
    const safeCol2 = Array.isArray(yAxis?.col2) ? yAxis.col2 : [];

    const series: (Highcharts.SeriesColumnOptions | null)[] = [
      selectedSeries === 'both' || selectedSeries === 'col1'
        ? {
            type: 'column' as const,
            name: col1Name,
            data: safeCol1,
            color: '#BAD4B7',
          }
        : null,
      selectedSeries === 'both' || selectedSeries === 'col2'
        ? {
            type: 'column' as const,
            name: col2Name,
            data: safeCol2,
            color: '#43573C',
          }
        : null,
    ];
    return series.filter((s): s is Highcharts.SeriesColumnOptions => s !== null);
  };

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      marginTop: 50,
      spacing: [20, 20, 20, 20], // inner padding
    },
    title: { text: 'Revenue', align: 'left' },
    xAxis: { categories: xAxis },
    yAxis: { title: { text: undefined } },
    legend: { align: 'center', verticalAlign: 'bottom' },
    plotOptions: {
      column: { borderRadius: 5, dataLabels: { enabled: false } },
    },
    series: getSeries(),
  };

  useEffect(() => {
    const chart = chartComponentRef.current?.chart;
    if (chart) {
      chart.update({ series: getSeries() }, true);
    }
  }, [selectedSeries, yAxis, col1Name, col2Name]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        padding: '20px', // outer padding
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Select neatly placed */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20 }}>
        <select
          value={selectedSeries}
          onChange={e => setSelectedSeries(e.target.value as 'both' | 'col1' | 'col2')}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value='both'>This Year</option>
          <option value='col1'>{col1Name}</option>
          <option value='col2'>{col2Name}</option>
        </select>
      </div>

      <HighchartsReact
        ref={chartComponentRef}
        highcharts={Highcharts}
        options={options}
        containerProps={{ style: { height: '100%', width: '100%' } }}
      />
    </div>
  );
};

export default ColumnCharts;
