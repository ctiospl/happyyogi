import { createWorker } from '../index.js';
import type { Job } from 'bullmq';

interface ExampleJobData {
  message: string;
}

// Example worker - customize for your needs
const exampleWorker = createWorker<ExampleJobData>(
  'example',
  async (job: Job<ExampleJobData>) => {
    console.log(`Processing job ${job.id}:`, job.data);

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`Job ${job.id} completed`);
    return { success: true };
  },
  { concurrency: 2 }
);

exampleWorker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed`);
});

exampleWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} has failed:`, error);
});

export { exampleWorker };

// Usage example:
// import { addJob } from '$lib/server/queues';
// await addJob('example', { message: 'Hello World' });
