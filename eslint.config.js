import defaultConfig from "@banjoanton/eslint-config";

export default [
    ...defaultConfig,
    {
        rules: {
            "@typescript-eslint/no-empty-object-type": "off",
            "react/forbid-component-props": "off",
            "no-redeclare": "off",
        },
    },
];
