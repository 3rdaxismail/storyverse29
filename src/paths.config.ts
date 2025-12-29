/**
 * Path Alias Configuration
 * 
 * Maps @ to src/ for cleaner imports throughout the app.
 * 
 * Example:
 * import { Button } from '@/components/ui/Button'
 * instead of:
 * import { Button } from '../../../../components/ui/Button'
 */

export const pathAliases = {
  '@': './src',
  '@components': './src/components',
  '@pages': './src/pages',
  '@styles': './src/styles',
  '@utils': './src/utils',
  '@hooks': './src/hooks',
  '@services': './src/services',
  '@types': './src/types',
};
