/* eslint-disable */
/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2021,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "@typescript-eslint/no-empty-function": [
      "error",
      { allow: ["arrowFunctions"] },
    ],
    "import/order": ["error", { alphabetize: { order: "asc" } }],
  },
};
