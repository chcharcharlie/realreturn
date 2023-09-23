import { alpha, Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Backdrop(theme: Theme) {
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(theme.palette.grey[800], 0.95),
        },
        invisible: {
          background: 'transparent',
        },
      },
    },
  };
}
