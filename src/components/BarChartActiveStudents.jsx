import React from 'react'

const BarChartActiveStudents = ({ data, size = 600, barColor = '#2196f3' }) => {
    // Adjust barWidth and size based on screen width
    const isMobile = window.innerWidth <= 640;
    const adjustedSize = isMobile ? size * 0.8 : size;
    const maxStudents = Math.max(...data.map(item => item.value));
    const barWidth = adjustedSize / data.length;
    
    return (
        <div className="flex flex-col items-center p-4 sm:p-8">
            <p className='font-bold text-lg sm:text-xl text-center'>תלמידים פעילים</p>
            <svg viewBox={`0 0 ${adjustedSize} ${adjustedSize * 0.66}`} className="min-w-72 max-w-[700px] h-auto">
                {data.map((item, index) => (
                    <g key={index}>
                        {/* Bar */}
                        <rect
                            x={index * barWidth + barWidth * 0.1}
                            y={adjustedSize * 0.6 - (item.value / maxStudents) * adjustedSize * 0.5}
                            width={barWidth * 0.8}
                            height={(item.value / maxStudents) * adjustedSize * 0.5}
                            fill={barColor}
                            className="transition-all duration-300"
                        />

                        {/* Value Label */}
                        <text
                            x={index * barWidth + barWidth / 2}
                            y={adjustedSize * 0.6 - (item.value / maxStudents) * adjustedSize * 0.5 - 10}
                            textAnchor="middle"
                            fontSize={isMobile ? "10" : "12"}
                            className="fill-gray-700 font-semibold"
                        >
                            {item.value}
                        </text>

                        {/* Class Label */}
                        <text
                            x={index * barWidth + barWidth / 2}
                            y={adjustedSize * 0.6 + 20}
                            textAnchor="middle"
                            fontSize={isMobile ? "12" : "16"}
                            className="fill-gray-700 font-semibold"
                        >
                            {item.name}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    )
}

export default BarChartActiveStudents;
