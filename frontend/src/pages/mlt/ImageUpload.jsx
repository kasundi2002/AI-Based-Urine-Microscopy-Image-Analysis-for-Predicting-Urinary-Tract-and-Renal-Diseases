import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ImageUpload = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/tiff': []
    },
    maxFiles: 1
  });

  return (
    <Paper 
      {...getRootProps()} 
      sx={{ 
        p: 6, 
        textAlign: 'center', 
        cursor: 'pointer',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.700',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover'
        }
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive ? "Drop the microscopy image here..." : "Drag & drop microscopy image here"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Supports JPEG, PNG, TIFF
      </Typography>
      <Button variant="outlined" component="span">
        Select File
      </Button>
    </Paper>
  );
};

export default ImageUpload;
