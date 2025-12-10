import React, { useState } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Define the props interface for type safety
interface SplineChartCardProps {
  title?: string; // Optional chart title
  height?: number; // Optional chart height
  seriesData: {
    filterKey: string; // Unique key for the filter (e.g., "thisMonth", "lastMonth")
    categories: string[]; // X-axis categories
    newClients: number[]; // Data for new clients
    repeatClients: number[]; // Data for repeat clients
  }[]; // Array of datasets for each filter
  filterOptions: { label: string; value: string }[]; // Filter dropdown options
  defaultFilter: string; // Default filter value
  newClientsColor?: string; // Optional color for new clients
  repeatClientsColor?: string; // Optional color for repeat clients
}

const SplineChartCard: React.FC<SplineChartCardProps> = ({
  title = 'Client Overview', // Default title
  height = 467, // Default height
  seriesData,
  filterOptions,
  defaultFilter,
  newClientsColor = '#3B82F6', // Default blue
  repeatClientsColor = '#F59E0B', // Default amber
}) => {
  const [filter, setFilter] = useState<string>(defaultFilter);

  // Find the current dataset based on the selected filter
  const currentData = seriesData.find(data => data.filterKey === filter) || seriesData[0];

  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
      height, // Dynamic height
      backgroundColor: 'transparent',
    },
    title: {
      text: title, // Dynamic title
      align: 'left',
      style: { fontSize: '16px', fontWeight: '600' },
    },
    xAxis: {
      categories: currentData.categories, // Dynamic categories
      lineColor: '#e5e7eb',
      tickColor: '#e5e7eb',
    },
    yAxis: {
      title: { text: undefined },
      gridLineColor: '#f3f4f6',
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      symbolRadius: 6,
    },
    colors: [newClientsColor, repeatClientsColor], // Dynamic colors
    plotOptions: {
      spline: {
        lineWidth: 3,
        marker: {
          enabled: false,
        },
      },
    },
    series: [
      {
        name: 'New Clients',
        type: 'spline',
        data: currentData.newClients, // Dynamic new clients data
      },
      {
        name: 'Repeat Clients',
        type: 'spline',
        data: currentData.repeatClients, // Dynamic repeat clients data
      },
    ],
    credits: { enabled: false },
  };

  return (
    <div className='bg-white shadow rounded-2xl p-4 relative'>
      {/* Dropdown */}
      <div className='absolute top-4 right-4'>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className='border border-gray-300 rounded-lg px-3 py-1 text-sm'
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{ style: { height: '100%', width: '100%' } }}
      />
    </div>
  );
};

export default SplineChartCard;
