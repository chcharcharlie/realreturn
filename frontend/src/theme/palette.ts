import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ColorSchema = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    neutral: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
}

// SETUP COLORS

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

const PRIMARY = {
  lighter: "#DCFDFA",
  light: '#95F0F5',
  main: '#4EC3E0',
  dark: '#2776A1',
  darker: '#0E3D6B',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#F9FAFB',
  light: '#DFE3E8',
  main: '#919EAB',
  dark: '#454F5B',
  darker: '#161C24',
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#CDF7FE',
  light: '#6AD6FD',
  main: '#099DF9',
  dark: '#045BB3',
  darker: '#012E77',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#ECFBD3',
  light: '#B3E97A',
  main: '#60B726',
  dark: '#328313',
  darker: '#145707',
  contrastText: '#FFFFFF',
};

const WARNING = {
  lighter: '#FEF6D0',
  light: '#FCDB73',
  main: '#F7B418',
  dark: '#B1750C',
  darker: '#764604',
  contrastText: '#FFFFFF',
};

const ERROR = {
  lighter: '#FFE7D6',
  light: '#FFA683',
  main: '#FF4A32',
  dark: '#B7191F',
  darker: '#7A0920',
  contrastText: '#FFFFFF',
};

const COMMON = {
  common: { black: '#000000', white: '#FFFFFF' },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.24),
  action: {
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export default function palette(themeMode: 'light' | 'dark') {
  const light = {
    ...COMMON,
    mode: 'light',
    text: {
      primary: '#FFFFFF',
      secondary: GREY[500],
      stockup: SUCCESS.main,
      stockdown: ERROR.main,
      disabled: GREY[600],
    },
    background: {
      paper: '21212e',
      default: GREY[900],
      neutral: alpha(GREY[500], 0.16),
    },
    action: {
      ...COMMON.action,
      active: GREY[500],
    },
  } as const;

  const dark = {
    ...COMMON,
    mode: 'dark',
    text: {
      primary: '#FFFFFF',
      secondary: GREY[500],
      stockup: SUCCESS.main,
      stockdown: ERROR.main,
      disabled: GREY[600],
    },
    background: {
      paper: '21212e',
      default: GREY[900],
      neutral: alpha(GREY[500], 0.16),
    },
    action: {
      ...COMMON.action,
      active: GREY[500],
    },
  } as const;

  return themeMode === 'light' ? light : dark;
}
