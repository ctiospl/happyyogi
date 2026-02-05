export interface JobData {
  [key: string]: unknown;
}

export interface JobResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface QueueConfig {
  name: string;
  concurrency?: number;
  defaultJobOptions?: {
    attempts?: number;
    backoff?: { type: 'exponential' | 'fixed'; delay: number };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
  };
}
