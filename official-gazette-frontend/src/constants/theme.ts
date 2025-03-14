export const COLORS = {
  primary: '#1E3A8A', // Deep blue for primary elements
  secondary: '#E11D48', // Red for accents and notifications
  background: '#F8FAFC', // Light background
  card: '#FFFFFF', // White for cards
  text: '#1E293B', // Dark text
  border: '#E2E8F0', // Light border
  notification: '#E11D48', // Red for notifications
  success: '#10B981', // Green for success states
  error: '#EF4444', // Red for error states
  warning: '#F59E0B', // Amber for warning states
  info: '#3B82F6', // Blue for info states
  disabled: '#94A3B8', // Slate for disabled states
  placeholder: '#94A3B8', // Slate for placeholders
  white: '#FFFFFF',
  textLight: '#666666',
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  xxl: 32,
  xxxl: 40,
};

export const FONTS = {
  regular: 'System', // Will be replaced with actual font
  medium: 'System-Medium', // Will be replaced with actual font
  bold: 'System-Bold', // Will be replaced with actual font
  light: 'System-Light', // Will be replaced with actual font
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const SPACING = {
  xs: SIZES.base / 2, // 4
  s: SIZES.base, // 8
  m: SIZES.base * 2, // 16
  l: SIZES.base * 3, // 24
  xl: SIZES.base * 4, // 32
  xxl: SIZES.base * 5, // 40
};

const theme = { COLORS, SIZES, FONTS, SHADOWS, SPACING };

export default theme;
