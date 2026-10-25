module.exports = {
	root: true,
	ignorePatterns: ["dist/", ".astro/", "public/_generated/"],
	env: {
		node: true,
		browser: true,
		es2022: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:astro/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: ["@typescript-eslint", "react"],
	rules: {
		"react/react-in-jsx-scope": "off",
		"react/prop-types": "off",
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
			},
		],
	},
	overrides: [
		{
			files: ["*.astro"],
			rules: { "react/no-unknown-property": "off", "react/jsx-key": "off" },
			parser: "astro-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser",
				extraFileExtensions: [".astro"],
			},
		},
	],
	settings: {
		react: {
			version: "detect",
		},
	},
};
