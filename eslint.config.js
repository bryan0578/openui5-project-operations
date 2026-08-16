const globals = require("globals");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**", ".ui5/**", "coverage/**"]
  },
  {
    files: ["webapp/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        sap: "readonly",
        QUnit: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { args: "none" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "smart"],
      "no-implicit-globals": "error"
    }
  }
];
