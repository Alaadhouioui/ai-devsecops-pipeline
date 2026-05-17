import { getModules } from '../services/simulationService.js';

export function listModules(req, res) {
  return res.json({ modules: getModules() });
}

export function getModule(req, res) {
  const found = getModules().find((item) => item.slug === req.params.slug);
  if (!found) {
    return res.status(404).json({ message: 'Module not found' });
  }

  return res.json({ module: found });
}

