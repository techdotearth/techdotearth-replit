import cron, { ScheduledTask } from 'node-cron';
import { AirQualityIngestionService } from './air-quality-ingestion.js';

export class CronScheduler {
  private aqIngestion: AirQualityIngestionService;
  private scheduledTasks: Map<string, ScheduledTask> = new Map();

  constructor() {
    this.aqIngestion = new AirQualityIngestionService();
  }

  /**
   * Start all scheduled tasks
   */
  start(): void {
    console.log('⏰ Starting cron scheduler...');
    
    // Air Quality Ingestion: Every hour on the hour (0 * * * *)
    // this.scheduleAirQualityIngestion();

    console.log(`✅ Started ${this.scheduledTasks.size} scheduled tasks`);
    this.logScheduledTasks();
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    console.log('⏸️ Stopping all scheduled tasks...');
    
    for (const [name, task] of this.scheduledTasks) {
      task.stop();
      console.log(`  ✓ Stopped: ${name}`);
    }
    
    this.scheduledTasks.clear();
    console.log('✅ All scheduled tasks stopped');
  }

  /**
   * Schedule hourly air quality data ingestion
   * Cron: 0 * * * * (every hour at minute 0)
   */
  private scheduleAirQualityIngestion(): void {
    const cronExpression = '38 * * * *'; // Every hour at minute 0
    const taskName = 'air-quality-ingestion';

    const task = cron.schedule(cronExpression, async () => {
      console.log('🔔 Cron triggered: Air Quality Ingestion');
      try {
        await this.aqIngestion.ingestHourlyData();
        console.log('✅ Scheduled air quality ingestion completed successfully');
      } catch (error: any) {
        console.error('❌ Scheduled air quality ingestion failed:', error.message);
        // Could add error reporting/alerting here in production
      }
    }, {
      timezone: 'UTC' // Ensure consistent UTC scheduling
    });

    this.scheduledTasks.set(taskName, task);
    console.log(`📅 Scheduled: ${taskName} (${cronExpression})`);
  }

  /**
   * Manual trigger for air quality ingestion (for testing/debugging)
   */
  async triggerAirQualityIngestion(): Promise<void> {
    console.log('🔧 Manual trigger: Air Quality Ingestion');
    try {
      await this.aqIngestion.ingestHourlyData();
      console.log('✅ Manual air quality ingestion completed successfully');
    } catch (error: any) {
      console.error('❌ Manual air quality ingestion failed:', error.message);
      throw error;
    }
  }

  /**
   * Get status of all scheduled tasks
   */
  getTaskStatus(): Record<string, { running: boolean, nextExecution?: Date }> {
    const status: Record<string, { running: boolean, nextExecution?: Date }> = {};
    
    for (const [name, task] of this.scheduledTasks) {
      status[name] = {
        running: task.running || false,
        // Note: node-cron doesn't expose next execution time directly
        nextExecution: undefined 
      };
    }
    
    return status;
  }

  /**
   * Log information about all scheduled tasks
   */
  private logScheduledTasks(): void {
    console.log('📋 Scheduled Tasks:');
    for (const [name] of this.scheduledTasks) {
      console.log(`  - ${name}`);
    }
    
    // Log next few scheduled runs (informational)
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
    console.log(`🕐 Next air quality ingestion: ${nextHour.toISOString()}`);
  }
}