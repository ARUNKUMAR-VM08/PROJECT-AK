module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|expo-status-bar|react-native-reanimated|react-native-gesture-handler)[\\\\/])'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  clearMocks: true,
  resetMocks: true,
};
