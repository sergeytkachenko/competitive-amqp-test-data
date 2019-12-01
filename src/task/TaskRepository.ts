import { Injectable } from '@nestjs/common';
import { InboxTaskMessage } from '../amqp/dto/InboxTaskMessage';
import { RedisClient } from 'redis';
import * as uuidv1 from 'uuid/v1';

@Injectable()
export class TaskRepository {

  constructor(private readonly redisClient: RedisClient) {}

  async addTask(task: InboxTaskMessage): Promise<void> {
    return new Promise(resolve => {
      const body = {
        ...task,
        id: uuidv1(),
      };
      this.redisClient.RPUSH(task.queue, JSON.stringify(body), () => resolve());
    });
  }

  async getNextTask(queue: string): Promise<any> {
    return new Promise(resolve => {
      this.redisClient.LPOP(queue, (err, json) => {
        return resolve(JSON.parse(json));
      });
    });
  }
}
