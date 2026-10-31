import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
   {
      ignores: ['dist/**', 'node_modules/**'],
   },
   eslint.configs.recommended,
   ...tseslint.configs.strictTypeChecked,
   ...tseslint.configs.stylisticTypeChecked,
   {
      languageOptions: {
         parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
         },
      },
      rules: {
         '@typescript-eslint/no-namespace': 'off',
         '@typescript-eslint/no-misused-spread': 'off',
         '@typescript-eslint/no-empty-object-type': 'off',
         '@typescript-eslint/no-floating-promises': 'off',
      },
   },
);
