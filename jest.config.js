module.exports = {
  roots: ["<rootDir>/test", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/.aws-sam/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
