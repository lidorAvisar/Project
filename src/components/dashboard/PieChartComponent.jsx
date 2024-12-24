import React from 'react';

const PieChartComponent = ({ data, size = 250 }) => {
  const center = size / 2;
  const radius = size * 0.45;
  const textRadius = size * 0.22;
  const minSliceAngle = 0.029;

  const processChartData = (data) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    // If there are no data values, return an empty slice for "No results"
    if (totalValue === 0) {
      return [
        {
          pathData: `M ${center} ${center} m 0 -${radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 -${radius * 2}`,
          color: 'lightgray',
          value: 0,
          text: 'אין תוצאות',
          textPosition: { x: center, y: center },
        },
      ];
    }

    // Handle the case with only one data point by creating a full circle slice
    const nonZeroItems = data.filter((item) => item.value > 0);

    if (nonZeroItems.length === 1) {
      return [
        {
          pathData: `M ${center} ${center} m 0 -${radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 -${radius * 2}`,
          color: nonZeroItems[0].color,
          name: nonZeroItems[0].name,
          value: nonZeroItems[0].value,
          textPosition: { x: center, y: center - textRadius },
        },
      ];
    }

    let cumulativePercentage = 0;
    return data.map((item) => {
      const slicePercentage = Math.max(item.value / totalValue, minSliceAngle);
      const [startX, startY] = polarToCartesian(center, center, radius, cumulativePercentage);
      cumulativePercentage += slicePercentage;
      const [endX, endY] = polarToCartesian(center, center, radius, cumulativePercentage);
      const largeArcFlag = slicePercentage > 0.5 ? 1 : 0;
      const [textX, textY] = polarToCartesian(center, center, textRadius, cumulativePercentage - slicePercentage / 2);

      return {
        pathData: `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`,
        color: item.color,
        name: item.name,
        value: item.value,
        textPosition: { x: textX, y: textY },
      };
    });
  };

  const polarToCartesian = (cx, cy, radius, percentage) => {
    const angleInRadians = 2 * Math.PI * percentage;
    const x = cx + radius * Math.cos(angleInRadians);
    const y = cy + radius * Math.sin(angleInRadians);
    return [x, y];
  };

  const slices = processChartData(data);

  return (
    <div className="flex flex-col items-center w-full">
      <svg width={`${size}`} height={`${size}`} viewBox={`0 0 ${size} ${size}`} className="w-auto h-auto">
        {slices.map((slice, index) => (
          <g key={index}>
            <path d={slice.pathData} fill={slice.color} />
            {slice.color !== 'transparent' && (
              <text
                x={slice.textPosition.x}
                y={slice.textPosition.y}
                fontSize="10"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white font-bold"
              >
                {slice.value > 0 ? slice.value : 0}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Legend with up to 8 colored squares */}
      <div dir='rtl' className="grid grid-cols-3 sm:grid-cols-2 gap-2">
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-4 h-4 mr-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-700 sm:font-semibold px-1">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartComponent;
