module.exports = {
  roots: ["<rootDir>/test", "<rootDir>/app", "<rootDir>/pipeline"],
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/cdk.out/", "/.aws-sam/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  collectCoverage: true,
};
