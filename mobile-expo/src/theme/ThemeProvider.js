// src/theme/ThemeProvider.js
import React, { createContext, useContext } from 'react';
import { Colors, Gradients, Fonts } from './theme';

const ThemeContext = createContext({
  colors: Colors,
  gradients: Gradients,
  fonts: Fonts,
});

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors: Colors, gradients: Gradients, fonts: Fonts }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
