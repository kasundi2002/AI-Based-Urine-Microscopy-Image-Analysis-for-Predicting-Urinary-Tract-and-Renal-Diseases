
import React, { useState } from 'react';

const UploadImage = ({ onAnalyze }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
       // Reset previous results if any
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    try {
      await onAnalyze(selectedFile);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Analysis failed. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Urine Sample</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-input-wrapper">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            id="file-upload"
          />
        </div>
        
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" style={{ maxWidth: '300px', maxHeight: '300px', marginTop: '1rem' }} />
          </div>
        )}

        <button type="submit" disabled={!selectedFile || loading} style={{ marginTop: '1rem', padding: '10px 20px' }}>
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </form>
    </div>
  );
};

export default UploadImage;
