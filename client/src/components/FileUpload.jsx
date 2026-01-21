// components/FileUpload.jsx
import React, { useState, useRef } from 'react';
import { validateResumeFile } from '../utils/validators';

const FileUpload = ({ onFileSelect, disabled = false, label = "Upload Resume (PDF)" }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const validation = validateResumeFile(selectedFile);
    
    if (validation.isValid) {
      setFile(selectedFile);
      setError('');
      onFileSelect(selectedFile);
    } else {
      setFile(null);
      setError(validation.error);
      onFileSelect(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files[0];
    const validation = validateResumeFile(droppedFile);
    
    if (validation.isValid) {
      setFile(droppedFile);
      setError('');
      onFileSelect(droppedFile);
    } else {
      setFile(null);
      setError(validation.error);
      onFileSelect(null);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">{label}</label>
      
      <div
        className={`file-upload-area ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={disabled}
          className="file-input"
        />
        
        {file ? (
          <div className="file-selected">
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="remove-button"
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="file-placeholder">
            <svg className="upload-icon" viewBox="0 0 24 24">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
            <p className="upload-text">
              Drag & drop your resume (PDF) or click to browse
            </p>
            <p className="upload-hint">Max file size: 5MB</p>
          </div>
        )}
      </div>
      
      {error && <p className="file-error">{error}</p>}
    </div>
  );
};

export default FileUpload;