import React, { useState } from "react";
import { useBlockchain } from "../BlockchainContext";
import "./StudentList.css";

export const StudentList: React.FC = () => {
  const { students, loading, error, updateAttendance } = useBlockchain();

  const handleToggleAttendance = async (studentId: number, currentStatus: boolean) => {
    try {
      await updateAttendance(studentId, !currentStatus);
    } catch (err) {
      console.error("Failed to update attendance:", err);
    }
  };

  if (loading) {
    return (
      <div className="student-list">
        <h2>Enrolled Students</h2>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="student-list error"><p>Error: {error}</p></div>;
  }

  if (students.length === 0) {
    return (
      <div className="student-list">
        <p className="no-students">No students enrolled yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="student-list">
      <h2>Enrolled Students ({students.length})</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index} className={student.present ? "present" : "absent"}>
              <td>{index}</td>
              <td>{student.name}</td>
              <td>{student.age}</td>
              <td>
                <span className={`badge ${student.present ? "present" : "absent"}`}>
                  <span className="badge-icon" aria-hidden>
                    {student.present ? "✓" : "✗"}
                  </span>
                  <span className="badge-text">
                    {student.present ? "Present" : "Absent"}
                  </span>
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleToggleAttendance(index, student.present)}
                  className="toggle-btn"
                  disabled={loading}
                >
                  Mark {student.present ? "Absent" : "Present"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
