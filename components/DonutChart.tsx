// --- DonutChart.tsx ---
// This component renders a responsive donut chart to visualize the asset allocation
// of the portfolio using the 'recharts' library.

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AccountData } from '../types';
import { UI_CLASSES } from '../constants';

/**
 * Props for the DonutChartComponent.
 */
interface DonutChartComponentProps {
  data: AccountData; // The account data containing assets and total value
}

const DonutChartComponent: React.FC<DonutChartComponentProps> = ({ data }) => {
  // Format the asset data to be compatible with the recharts Pie component
  const chartData = data.assets.map(asset => ({ name: asset.name, value: asset.value, color: asset.color }));

  return (
    // The container is relative to position the total value text in the center.
    // It has a responsive height.
    <div className="relative w-full h-64 sm:h-72">
      {/* ResponsiveContainer makes the chart adapt to the parent container's size */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" // Center X
            cy="50%" // Center Y
            innerRadius="60%" // Creates the donut hole
            outerRadius="85%" // The outer edge of the donut
            fill="#8884d8" // Default fill, but overridden by Cell component below
            paddingAngle={2} // Small gap between pie slices
            dataKey="value" // The key in the data object that holds the numerical value
            nameKey="name" // The key for the name/label
            stroke="none" // No border around slices
            isAnimationActive={true} // Enable the initial render animation
            animationDuration={800}
          >
            {/* Map over the data to create a <Cell> for each slice. 
                This allows individual styling (e.g., color) for each segment. */}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* This div is absolutely positioned to overlay text in the center of the donut chart. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${UI_CLASSES.textPrimary}`}>
          {/* Format the total value to a Russian locale string with 2 decimal places */}
          {data.totalValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.currency}
        </p>
        <p className={`${UI_CLASSES.textSecondary} text-sm md:text-base mt-1`}>
          {data.assetCount} актива
        </p>
      </div>
    </div>
  );
};

export default DonutChartComponent;
