import React, { useState } from "react";
import { useBlockchain } from "../BlockchainContext";
import "./AddStudent.css";

export const AddStudent: React.FC = () => {
  const { addStudent, loading, error, status } = useBlockchain();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!name.trim() || !age) {
      setLocalError("Please fill in all fields");
      return;
    }

    const ageNum = parseInt(age);
    if (ageNum < 1 || ageNum > 120) {
      setLocalError("Please enter a valid age");
      return;
    }

    try {
      setSubmitting(true);
      console.log("[AddStudent UI] Submitting form...");
      await addStudent(name.trim(), ageNum);
      
      console.log("[AddStudent UI] Form submission successful");
      setSuccess(true);
      setName("");
      setAge("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[AddStudent UI] Failed to add student:", errorMsg);
      setLocalError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-student">
      <h2>Add New Student</h2>
      {success && <div className="success-message">✓ Student added successfully!</div>}
      {status && <div className="status-message">{status}</div>}
      {(localError || error) && (
        <div className="error-message">{localError || error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Student Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Doe"
            disabled={loading || submitting}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g., 20"
            disabled={loading || submitting}
            min="1"
            max="120"
          />
        </div>

        <button
          type="submit"
          disabled={loading || submitting}
          className="submit-btn"
        >
          {submitting ? "Adding..." : "Add Student"}
        </button>
      </form>
    </div>
  );
};
