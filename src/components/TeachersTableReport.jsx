import React from 'react';

const TeachersTableReport = ({ teacherMinutesReport }) => {
  const schools = ["שרייבר", "יובלי", "צבאי"];

  return (
    <div className="overflow-x-auto flex justify-center ">
      <table className="w-full max-w-[1400px] bg-white border-collapse rounded-lg shadow-lg">
        <thead>
          <tr>
            {schools.map((school, index) => (
              <th
                key={index}
                className={`py-4 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 font-semibold border-b border-gray-300 text-center ${index === 0
                    ? "rounded-tl-lg"
                    : index === schools.length - 1
                      ? "rounded-tr-lg" 
                      : ""
                  }`}
              >
                {school}
              </th>
            ))}
          </tr>

        </thead>
        <tbody>
          {Array.from({ length: Math.max(...teacherMinutesReport.map(school => school.teachers.length)) }).map((_, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              {teacherMinutesReport.map((schoolData, colIndex) => {
                const teacher = schoolData.teachers[rowIndex];

                return (
                  <td
                    key={colIndex}
                    className={`py-4 text-gray-800 text-center border-gray-300 ${colIndex < teacherMinutesReport.length - 1 ? "border-r" : ""} ${rowIndex === teacherMinutesReport.length - 1 && colIndex === teacherMinutesReport.length - 1 ? "rounded-br-lg" : ""}`}
                  >
                    {teacher ? (
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-gray-700">{teacher.displayName}</span>
                        <span className="text-gray-500">{teacher.totalHours} שעות</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeachersTableReport;
