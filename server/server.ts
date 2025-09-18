import app from './api/index.js';
import { CronScheduler } from './services/cron-scheduler.js';

const PORT = process.env.PORT || 3001;

// Initialize cron scheduler
const scheduler = new CronScheduler();

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
  
  // Start scheduled tasks
  scheduler.start();
  
  console.log(`⏰ Cron scheduler started for air quality ingestion`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('⏸️ Received SIGINT, shutting down gracefully...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('⏸️ Received SIGTERM, shutting down gracefully...');
  scheduler.stop();
  process.exit(0);
});