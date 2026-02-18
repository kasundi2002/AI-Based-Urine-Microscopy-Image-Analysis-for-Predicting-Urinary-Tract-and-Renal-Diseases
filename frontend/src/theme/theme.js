import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00bcd4', // Cyan (darker for light mode contrast)
      contrastText: '#fff',
    },
    secondary: {
      main: '#673ab7', // Deep Purple
    },
    background: {
      default: '#f5f7fa', // Very light grey/blue
      paper: '#ffffff', // White
    },
    text: {
      primary: '#1a2027', // Almost black
      secondary: '#5f6c7b', // Dark grey
    },
    success: {
      main: '#2e7d32', // Darker green
    },
    error: {
      main: '#d32f2f', // Darker red
    },
    warning: {
      main: '#ed6c02', // Darker orange
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
        },
      },
    },
  },
});

export default theme;
