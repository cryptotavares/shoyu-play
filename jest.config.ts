/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
  bail: true,
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  roots: [
    "<rootDir>/src/",
    "<rootDir>/test/"
  ],
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test))\\.[tj]sx?$",
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  verbose: true,
};
