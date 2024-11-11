import React from 'react';

const BarChartActiveStudents = ({ data, barColor = '#2196f3' }) => {
    const chartHeight = 400; // Keeping the height as is
    const maxStudents = Math.max(...data.map(item => item.value));
    const chartWidth = data.length * 20; // Dynamically adjust the width based on data length
    const barWidth = chartWidth / data.length;

    return (
        <div className="flex flex-col items-center p-6 w-full max-w-5xl mx-auto  rounded-lg shadow-lg">
            <p className="font-bold text-lg sm:text-xl text-center mb-4 text-gray-800">תלמידים פעילים</p>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={chartHeight}>
                {data.map((item, index) => (
                    <g key={index}>
                        {/* Bar */}
                        <rect
                            x={index * barWidth + barWidth * 0.1}
                            y={chartHeight - (item.value / maxStudents) * chartHeight * 0.8}
                            width={barWidth * 0.8}
                            height={(item.value / maxStudents) * chartHeight * 0.8}
                            fill={barColor}
                            className="transition-all duration-300"
                        />

                        {/* Value Label */}
                        <text
                            x={index * barWidth + barWidth / 2}
                            y={chartHeight - (item.value / maxStudents) * chartHeight * 0.8 - 25}
                            textAnchor="middle"
                            fontSize="12"
                            className="fill-gray-700 font-semibold"
                        >
                            {item.value}
                        </text>

                        {/* Class Label */}
                        <text
                            x={index * barWidth + barWidth / 2}
                            y={chartHeight - 10}
                            textAnchor="middle"
                            fontSize="14"
                            className="fill-gray-700 font-semibold"
                        >
                            {item.name}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default BarChartActiveStudents;
