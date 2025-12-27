import { vi } from 'vitest';

// Use manual mocks from __mocks__ to redirect Node's fs to memfs for all tests
vi.mock('fs');
vi.mock('fs/promises');
