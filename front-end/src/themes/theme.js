import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF4081', // Pink
    },
    secondary: {
      main: '#FFD600', // Yellow
    },
    background: {
      default: '#FFF3E0', // Light yellow background
    },
  },
  typography: {
    fontFamily: 'Comic Sans MS',
  },
});

export default theme;