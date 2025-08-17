module.exports = {
  env: {
    node: true,
    es2021: true,
    commonjs: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "commonjs",
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-unused-vars": "warn",
    "no-console": "off", // Allow console.log for server logging
    "prefer-const": "error",
    "no-var": "error",
    "@typescript-eslint/no-require-imports": "off", // Disable TypeScript rule
  },
};
