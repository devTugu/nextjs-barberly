import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      all: false,
      include: [
        'src/shared/lib/**',
        'src/shared/config/**',
        'src/entities/session/lib/**',
        'src/entities/booking/lib/booking-math.ts',
        'src/entities/booking/lib/booking-format.ts',
        'src/entities/permission/lib/group-permissions.ts',
        'src/features/admin-schedule/ui/schedule-weekly-draft.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
