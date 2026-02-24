import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
      elevation={0}
      sx={{ 
        p: 6, textAlign: 'center', cursor: 'pointer',
        border: '2px dashed',
        borderColor: isDragActive ? '#00bcd4' : alpha('#9e9e9e', 0.25),
        bgcolor: isDragActive ? alpha('#00bcd4', 0.04) : 'transparent',
        borderRadius: 4,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: '#00bcd4',
          bgcolor: alpha('#00bcd4', 0.02),
          transform: 'translateY(-2px)',
        }
      }}
    >
      <input {...getInputProps()} />
      
      <Box sx={{ 
        width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
        bgcolor: isDragActive ? alpha('#00bcd4', 0.1) : alpha('#00bcd4', 0.06),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
      }}>
        <CloudUploadIcon sx={{ 
          fontSize: 36, 
          color: isDragActive ? '#00bcd4' : alpha('#00bcd4', 0.7),
          transition: 'all 0.3s',
        }} />
      </Box>

      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: isDragActive ? '#00bcd4' : 'text.primary' }}>
        {isDragActive ? "Drop your image here..." : "Upload Microscopy Image"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto', lineHeight: 1.6 }}>
        Drag and drop a microscopy image or click to browse. The AI will automatically detect and classify urine sediments.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
        {['JPEG', 'PNG', 'TIFF'].map(fmt => (
          <Chip 
            key={fmt} 
            icon={<ImageIcon sx={{ fontSize: 14 }} />} 
            label={fmt} 
            size="small" 
            variant="outlined"
            sx={{ fontSize: '0.65rem', fontWeight: 600, height: 24 }}
          />
        ))}
      </Box>
      
      <Button 
        variant="outlined" 
        component="span"
        sx={{ 
          textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 4,
          borderColor: alpha('#00bcd4', 0.3), color: '#00bcd4',
          '&:hover': { borderColor: '#00bcd4', bgcolor: alpha('#00bcd4', 0.04) }
        }}
      >
        Select File
      </Button>
    </Paper>
  );
};

export default ImageUpload;
