// eslint.config.cjs
const globals = require("globals");
const pluginJs = require("@eslint/js");
const tseslint = require("typescript-eslint");
const pluginReactConfig = require("eslint-plugin-react/configs/recommended.js");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ...pluginReactConfig, // Spread operator for properties of pluginReactConfig
    // Add rules specific to React files here
    rules: {
      ...(pluginReactConfig.rules || {}), // Spread existing rules from pluginReactConfig.rules if they exist
      "react/react-in-jsx-scope": "off" // Turn off react-in-jsx-scope
    },
    settings: { react: { version: "detect" } }
  },
  prettierConfig,
  { ignores: ["dist/", "node_modules/", "vite.config.ts", "eslint.config.cjs", ".prettierrc.cjs"] }
];
