import js from '@eslint/js';
import node from 'eslint-plugin-n';

export default [
    {
        files: ['**/*.js'],
        ignores: ['node_modules/**'],
    },
    // eslint:recommended を再現
    js.configs.recommended,
    // eslint-plugin-node の recommended を再現
    node.configs['flat/recommended-module'],
    {
        name: 'husapple-protocol',
        files: ['**/*.js'],
        rules: {
            'no-unused-vars': ['error', { caughtErrors: 'none', argsIgnorePattern: '^_' }],
            // eslint-plugin-node で指定していたルールを eslint-plugin-n として再現
            'n/file-extension-in-import': ['error', 'always'],
            'n/prefer-global/buffer': ['error', 'always'],
            'n/prefer-global/console': ['error', 'always'],
            'n/prefer-global/process': ['error', 'always'],
            'n/prefer-global/url-search-params': ['error', 'always'],
            'n/prefer-global/url': ['error', 'always'],
            'n/prefer-promises/dns': 'error',
            'n/prefer-promises/fs': 'error',
        },
    },
];
