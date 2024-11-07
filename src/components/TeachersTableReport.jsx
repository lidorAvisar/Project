import React from 'react';

const TeachersTableReport = ({ teacherMinutesReport }) => {
  const schools = ["שרייבר", "יובלי", "צבאי"];

  return (
    <div className="overflow-x-auto flex justify-center">
      <table className="w-full max-w-[1400px] bg-white border-collapse border border-gray-300">
        <thead>
          <tr>
            {schools.map((school, index) => (
              <th
                key={index}
                className={`py-4 bg-gray-100 text-gray-700 font-bold border-b border-gray-300 ${index < schools.length - 1 ? "border-r" : ""}`}
              >
                {school}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(...teacherMinutesReport.map(school => school.teachers.length)) }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {teacherMinutesReport.map((schoolData, colIndex) => {
                const teacher = schoolData.teachers[rowIndex];

                return (
                  <td
                    key={colIndex}
                    className={`py-3 text-gray-800 border-b text-center border-gray-300 ${colIndex < teacherMinutesReport.length - 1 ? "border-r" : ""}`}
                  >
                    {teacher ? (
                      <>
                        <span className="font-semibold">{teacher.displayName}</span>
                        <span className="text-gray-500"> - {teacher.totalHours} שעות</span>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
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
