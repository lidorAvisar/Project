import React from 'react';

const PieChartComponent = ({ data, size = 500 }) => {
  const center = size / 2;
  const radius = size * 0.5;
  const textRadius = size * 0.3;
  const minSliceAngle = 0.0;

  const processChartData = (data) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    if (data.length < 3) {
      data = [...data, { name: '', value: totalValue * minSliceAngle, color: 'transparent' }];
    }

    let cumulativePercentage = 0;

    return data.map((item) => {
      let slicePercentage = item.value / totalValue || minSliceAngle;
      slicePercentage = Math.max(minSliceAngle, slicePercentage);

      const [startX, startY] = polarToCartesian(center, center, radius, cumulativePercentage);
      cumulativePercentage += slicePercentage;
      const [endX, endY] = polarToCartesian(center, center, radius, cumulativePercentage);

      const largeArcFlag = slicePercentage > 0.5 ? 1 : 0;

      const [textX, textY] = polarToCartesian(center, center, textRadius, cumulativePercentage - slicePercentage / 2);
      const [nameX, nameY] = polarToCartesian(center, center, textRadius * 1.4, cumulativePercentage - slicePercentage / 2);

      return {
        pathData: `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`,
        color: item.color,
        name: item.name,
        value: item.value,
        textPosition: { x: textX, y: textY },
        namePosition: { x: nameX, y: nameY },
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
    <div className="flex flex-col items-center py-4 w-full">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full  sm:w-[120%]"
      >
        {slices.map((slice, index) => (
          <g key={index}>
            <path d={slice.pathData} fill={slice.color} />
            {slice.color !== 'transparent' && (
              <>
                <text
                  x={slice.textPosition.x}
                  y={slice.textPosition.y}
                  fontSize="20"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white font-semibold"
                >
                  {slice.value}
                </text>
                <text
                  x={slice.namePosition.x}
                  y={slice.namePosition.y}
                  fontSize="20"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-gray-700 font-semibold"
                >
                  {slice.name}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>

      {/* Quantity Bars */}
      <div className="w-full mt-4 max-w-[300px] sm:max-w-[400px] md:max-w-[500px]">
        {[...data].reverse().map((item, index) => (
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
            <span className="ml-3 text-gray-700 font-semibold">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartComponent;
