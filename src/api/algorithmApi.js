const API_BASE = 'http://localhost:3001/api';

/**
 * Run an algorithm via the C++ backend.
 * @param {string} algorithm  - 'bubbleSort' | 'selectionSort' | 'insertionSort' | 'linearSearch' | 'binarySearch'
 * @param {number[]} array    - The input array
 * @param {number} [target]   - Required for search algorithms
 * @returns {Promise<object[]>} - Resolves to the array of steps
 */
export async function runAlgorithm(algorithm, array, target) {
  const body = { algorithm, array };
  if (target !== undefined) body.target = target;

  const response = await fetch(`${API_BASE}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Backend error: ${response.status}`);
  }

  const data = await response.json();
  return data.steps;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
