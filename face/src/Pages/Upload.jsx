import React, { useState } from "react";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [peopleName, setCriminalName] = useState("");
  const [isExisting, setIsExisting] = useState(false); // state for checkbox
  const [message, setMessage] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle input for people name
  const handleCriminalNameChange = (e) => {
    setCriminalName(e.target.value);
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    setIsExisting(e.target.checked);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form data
    if (!file || !peopleName) {
      alert("Please fill in both the people name and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("people_name", peopleName); // Append people name to form data
    formData.append("is_existing", isExisting); // Append checkbox value

    try {
      // Send the request to your FastAPI backend
      const response = await fetch(
        `http://localhost:8000/upload_people_image/${peopleName}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image.");
      }

      const data = await response.json();
      if (data && data.message) {
        setMessage(data.message);
        setImagePath(data.image_path);
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Upload Criminal Record</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="people_name" style={styles.label}>Criminal Name:</label>
          <input
            type="text"
            id="people_name"
            value={peopleName}
            onChange={handleCriminalNameChange}
            style={styles.input}
            required
          />
        </div>

       

        <div style={styles.formGroup}>
          <label htmlFor="file" style={styles.label}>Select Criminal Image:</label>
          <input
            type="file"
            id="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            style={styles.input}
            required
          />
        </div>

         {/* Checkbox for existing people */}
        <div style={styles.formGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isExisting}
              onChange={handleCheckboxChange}
              style={styles.checkbox}
            />
            Existing Criminal Record
          </label>
        </div>

        <button type="submit" style={styles.submitButton}>Upload Image</button>
      </form>

      {message && (
        <div style={styles.successMessage}>
          <p>{message}</p>
          <p>Image Path: {imagePath}</p>
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

// Styling for the page
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '5px',
    fontFamily: 'Arial, sans-serif',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#333',
    display: 'inline-block',
    marginTop: '5px',
  },
  checkbox: {
    marginRight: '10px',
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  submitButtonHover: {
    backgroundColor: '#0056b3',
  },
  successMessage: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '5px',
    border: '1px solid #c3e6cb',
    width: '100%',
    maxWidth: '400px',
  },
  errorMessage: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '5px',
    border: '1px solid #f5c6cb',
    width: '100%',
    maxWidth: '400px',
  },
};

export default Upload;
