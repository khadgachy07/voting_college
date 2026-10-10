export async function debug(req, res) {
  // Minimal debug endpoint — only available in development, no sensitive data
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json({
    nodeVersion: process.version,
    uptime: Math.round(process.uptime()),
    memoryRssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });
}
