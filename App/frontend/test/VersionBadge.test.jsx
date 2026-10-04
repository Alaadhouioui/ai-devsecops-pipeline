// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import VersionBadge from '../src/components/VersionBadge.jsx';
import { api } from '../src/services/api.js';

vi.mock('../src/services/api.js', () => ({
  api: { get: vi.fn() }
}));

let container;
let root;

afterEach(() => {
  if (root) act(() => root.unmount());
  container?.remove();
  root = null;
  container = null;
  vi.resetAllMocks();
});

test('shows build metadata after the version request succeeds', async () => {
  api.get.mockResolvedValue({
    data: { version: '1.2.3', buildNumber: '42', commit: 'abcdef1' }
  });
  container = document.createElement('div');
  root = createRoot(container);

  await act(async () => {
    root.render(createElement(VersionBadge));
  });

  expect(api.get).toHaveBeenCalledWith('/version');
  expect(container.textContent).toContain('v1.2.3 · build #42 · abcdef1');
});

test('shows the offline label when the version request fails', async () => {
  api.get.mockRejectedValue(new Error('offline'));
  container = document.createElement('div');
  root = createRoot(container);

  await act(async () => {
    root.render(createElement(VersionBadge));
  });

  expect(container.textContent).toContain('v-- (offline)');
});
