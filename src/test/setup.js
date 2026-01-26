import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Расширяем Vitest matchers с jest-dom matchers
expect.extend(matchers);

// Очистка после каждого теста
afterEach(() => {
  cleanup();
});

