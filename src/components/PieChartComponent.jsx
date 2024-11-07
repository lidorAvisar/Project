import React from 'react';

const PieChartComponent = ({ data, size = 500 }) => {
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
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full sm:w-[120%]">
        {slices.map((slice, index) => (
          <g key={index}>
            <path d={slice.pathData} fill={slice.color} />
            {slice.color !== 'transparent' && (
              <text
                x={slice.textPosition.x}
                y={slice.textPosition.y}
                fontSize="20"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white font-semibold"
              >
                {slice.value > 0 ? slice.value : slice.text}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Quantity Bars */}
      {data.length > 0 && data.some((item) => item.value > 0) ? (
        <div className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px]">
          {data.map((item, index) => (
            <div key={index} className="flex items-center my-2">
              <div className="bg-gray-300 rounded-lg h-6 flex items-center w-full">
                <div
                  className="h-6 rounded-lg flex justify-center items-center"
                  style={{
                    width: `${(item.value / data.reduce((sum, i) => sum + i.value, 0)) * 100}%`,
                    backgroundColor: item.color,
                  }}
                >
                  <span className={`text-white font-semibold ${item.value < 5 && 'ps-3'}`}>
                    {item.value}
                  </span>
                </div>
              </div>
              <span className="ml-3 text-gray-700 font-semibold" style={{ color: item.color }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 font-semibold mt-4">
          אין תוצאות
        </div>
      )}
    </div>
  );
};

export default PieChartComponent;
