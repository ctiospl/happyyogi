import { Queue, Worker, type JobsOptions, type Processor } from 'bullmq';
import { getRedisConnection } from './connection.js';

const queues = new Map<string, Queue>();

export function getQueue<T = unknown>(name: string): Queue<T> {
  let queue = queues.get(name);
  if (!queue) {
    queue = new Queue<T>(name, {
      connection: getRedisConnection()
    });
    queues.set(name, queue);
  }
  return queue as Queue<T>;
}

export function createWorker<T = unknown>(
  queueName: string,
  processor: Processor<T>,
  options?: { concurrency?: number }
): Worker<T> {
  return new Worker<T>(queueName, processor, {
    connection: getRedisConnection(),
    concurrency: options?.concurrency || 1
  });
}

export async function addJob<T = unknown>(
  queueName: string,
  data: T,
  options?: JobsOptions
): Promise<string> {
  const queue = getQueue<T>(queueName);
  const job = await queue.add('job', data, options);
  return job.id || '';
}

export async function closeAllQueues(): Promise<void> {
  for (const queue of queues.values()) {
    await queue.close();
  }
  queues.clear();
}
