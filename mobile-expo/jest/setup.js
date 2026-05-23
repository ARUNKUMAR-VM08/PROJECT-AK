// jest/setup.js
// Mock react-native-reanimated to avoid native errors during tests
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // The mock throws errors for animated timers, so override them
  Reanimated.default.call = () => {};
  return Reanimated;
});

