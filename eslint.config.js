import eslintConfig from "@banjoanton/eslint-config";

export default [
    ...eslintConfig,
    {
        rules: {
            "@typescript-eslint/no-empty-object-type": "off",
        },
    },
];
