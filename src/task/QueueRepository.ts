import { Inject, Injectable } from '@nestjs/common';
import { InboxTaskMessage } from '../amqp/dto/InboxTaskMessage';
import { RedisClient } from 'redis';

@Injectable()
export class QueueRepository {

  private queues: string[] = [];

  constructor(private readonly redisClient: RedisClient) {
    this.init();
  }

  private async init(): Promise<any> {
    await this.actualiseQueues();
  }

  async addQueueNotExists(queue: string): Promise<any> {
    if (this.queues.indexOf(`${queue}`) !== -1) {
      return Promise.resolve();
    }
    await this.addQueue(queue);
    this.queues.push(queue);
  }

  private async actualiseQueues(): Promise<any> {
    return new Promise(resolve => {
      this.redisClient.SMEMBERS('queue', (err, list) => {
        this.queues = list;
        resolve();
      });
    });
  }

  private async addQueue(queue: string): Promise<void> {
    return new Promise(resolve => {
      this.redisClient.SADD('queue', queue, () => resolve());
    });
  }

  getQueues(): string[] {
    return this.queues;
  }
}
