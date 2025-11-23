import { createTheme, MantineColorsTuple } from '@mantine/core';

// Custom color tuples for Mantine theme
const meliYellow: MantineColorsTuple = [
  '#FFFACC', // 0 - lightest
  '#FFF799',
  '#FFF466',
  '#FFF133',
  '#FFEE00',
  '#FFE600', // 5 - base
  '#CCBB00',
  '#998C00',
  '#665D00',
  '#332E00', // 9 - darkest
];

const meliBlue: MantineColorsTuple = [
  '#E6F2FF', // 0 - lightest
  '#B8DCFF',
  '#8AC7FF',
  '#5CB1FF',
  '#2E9CFF',
  '#3483FA', // 5 - base
  '#2A69C8',
  '#1F4F96',
  '#153564',
  '#0A1A32', // 9 - darkest
];

const meliGreen: MantineColorsTuple = [
  '#E6F7EF', // 0 - lightest
  '#B3E6CE',
  '#80D4AD',
  '#4DC38C',
  '#1AB16B',
  '#00A650', // 5 - base
  '#008540',
  '#006330',
  '#004220',
  '#002110', // 9 - darkest
];

const meliRed: MantineColorsTuple = [
  '#FFE9EB', // 0 - lightest
  '#FFC2C7',
  '#FF9BA3',
  '#FF747F',
  '#FF4D5B',
  '#F23D4F', // 5 - base
  '#C2313F',
  '#91252F',
  '#61181F',
  '#300C10', // 9 - darkest
];

export const mantineTheme = createTheme({
  primaryColor: 'meliBlue',
  colors: {
    meliYellow,
    meliBlue,
    meliGreen,
    meliRed,
  },
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
});
