import React from 'react'

const TeachersTableReport = ({ teachersData }) => {
  const schools = ["שרייבר", "יובלי", "צבאי"];

  const getSortedTeachersBySchool = (schoolName) => {
    return teachersData
      .filter((teacher) => teacher.school === schoolName)
      .sort((a, b) => b.hoursWorked - a.hoursWorked);
  };

  return (
    <div className="overflow-x-auto flex justify-center">
      <table className="w-full max-w-[1400px] bg-white border-collapse border border-gray-300">
        <thead>
          <tr>
            {schools.map((school, index) => (
              <th
                key={index}
                className={`py-4 bg-gray-100 text-gray-700 font-bold border-b border-gray-300 ${index < schools.length - 1 ? "border-r" : ""
                  }`}
              >
                {school}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Find the max number of teachers in any school to structure the rows evenly */}
          {Array.from({
            length: Math.max(
              ...schools.map((school) =>
                getSortedTeachersBySchool(school).length
              )
            ),
          }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {schools.map((school, colIndex) => {
                const sortedTeachers = getSortedTeachersBySchool(school);
                const teacher = sortedTeachers[rowIndex];

                return (
                  <td
                    key={colIndex}
                    className={`py-3 text-gray-800 border-b text-center border-gray-300 ${colIndex < schools.length - 1 ? "border-r" : ""
                      }`}
                  >
                    {teacher ? (
                      <>
                        <span className="font-semibold">{teacher.name}</span>
                        <span className="text-gray-500"> - {teacher.hoursWorked} שעות</span>
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
  )
}

export default TeachersTableReport