const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Path to compiled C++ binary
const BINARY = path.join(__dirname, 'src', 'algorithms.exe');

/**
 * POST /api/run
 * Body: { algorithm: string, array: number[], target?: number }
 * Returns: { steps: AlgorithmStep[] }
 */
app.post('/api/run', (req, res) => {
  const { algorithm, array, target } = req.body;

  if (!algorithm || !Array.isArray(array)) {
    return res.status(400).json({ error: 'algorithm and array are required' });
  }

  if (array.length === 0) {
    return res.json({ steps: [] });
  }

  // Pass array as a space-separated string, target as third arg
  const args = [algorithm, array.join(' ')];
  if (target !== undefined && target !== null) {
    args.push(String(target));
  }

  execFile(BINARY, args, { timeout: 5000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('C++ exec error:', err.message);
      console.error('stderr:', stderr);
      return res.status(500).json({ error: 'Algorithm execution failed', detail: stderr });
    }

    try {
      const steps = JSON.parse(stdout);
      res.json({ steps });
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message);
      console.error('stdout was:', stdout);
      res.status(500).json({ error: 'Failed to parse C++ output as JSON' });
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'C++ algorithm backend running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`   C++ binary: ${BINARY}`);
});
