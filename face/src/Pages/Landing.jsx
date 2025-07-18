import React, { useState } from "react";
import { Typography, Button, CircularProgress, Box, Card, CardContent, TextField } from "@mui/material";

const Landing = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }

    setLoading(true);
    setResponse(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("https://face-record-checker.onrender.com/check_face/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Network response was not ok.");
      }

      const result = await res.json();
      setLoading(false);

      if (result.error) {
        setError(result.error);
      } else {
        setResponse(result);
      }
    } catch (err) {
      setLoading(false);
      setError("An error occurred while processing the image.");
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",paddingTop:"50px",paddingBottom:"100px"}}>
      <Card sx={{ width: "400px", padding: 3, textAlign: "center",margin:"2vw", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Face Record Checker
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Upload a photo to check if it matches any records.
          </Typography>

          {/* File Upload Input */}
          <TextField
            type="file"
            fullWidth
            onChange={handleFileChange}
            inputProps={{ accept: "image/*" }} // Restrict to image files
            sx={{ marginBottom: 2 }}
            variant="outlined"
          />

          {/* Upload Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleFileUpload}
            disabled={loading}
            sx={{ marginBottom: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Upload & Check"}
          </Button>

          {/* Error Message */}
          {error && (
            <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}

          {/* Results */}
          {response && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="h6" color={response.match ? "primary" : "error"}>
                Match Found: {response.match ? "Yes" : "No"}
              </Typography>
              {response.match && (
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Name: {response.people_name}
                </Typography>
              )}
            </Box>
          )}

          {/* Image Preview */}
          {selectedFile && (
            <Box sx={{ marginTop: 2, textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary">
                Selected Image:
              </Typography>
              <Box
                sx={{
                  width: "300px",
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 2,
                  border: "2px solid #ccc",
                  padding: 2,
                }}
              >
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected Preview"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Landing;
