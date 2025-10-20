// Global test setup file

// Mock console.log to suppress decorator logging during tests
const originalConsoleLog = console.log;

// @ts-ignore - Jest globals are available in test environment
beforeAll(() => {
  // @ts-ignore
  console.log = jest.fn();
});

// @ts-ignore
afterAll(() => {
  console.log = originalConsoleLog;
});
