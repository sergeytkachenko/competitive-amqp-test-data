import { Inject, Injectable } from '@nestjs/common';
import { InboxTaskMessage } from '../amqp/dto/InboxTaskMessage';

@Injectable()
export class QueueRepository {

  private queues: string[] = [];

  constructor(@Inject('CASSANDRA_CLIENT') private readonly cassandraClient: any) {
    this.init();
  }

  private async init(): Promise<any> {
    await this.actualiseQueues();
  }

  private async addQueueNotExists(queue: string): Promise<any> {
    if (this.queues.indexOf(`${queue}`) !== -1) {
      return Promise.resolve();
    }
    const queryTask = `SELECT id FROM task_${queue} LIMIT 1;`;
    const result = await this.cassandraClient.execute(queryTask);
    const taskId = result.rows[0].id;
    const query = `INSERT INTO queue (name, last_task_id) VALUES (?, ?);`;
    await this.cassandraClient.execute(query, [ queue, taskId ]);
    this.queues.push(queue);
  }

  private async actualiseQueues(): Promise<any> {
    const query = 'SELECT * FROM queue;';
    const result = await this.cassandraClient.execute(query);
    const tables = result.rows;
    const names = Array.from(tables).map(t => (t as any).name);
    if (names && names.length) {
      this.queues = names;
    }
  }

  async addQueue(queue: string): Promise<void> {
    await this.addQueueNotExists(queue);
    return Promise.resolve();
  }

  getQueues(): string[] {
    return this.queues;
  }

  async updateLastTask(queue: string, taskId: string): Promise<void> {
    const query = `UPDATE queue SET last_task_id = ? WHERE name = ?;`;
    await this.cassandraClient.execute(query, [ taskId, queue ]);
  }

  async getLastTaskIdByQueue(queue: string): Promise<string> {
    const query = `SELECT last_task_id FROM queue WHERE name = ?;`;
    const result = await this.cassandraClient.execute(query, [ queue ]);
    return result.rows[0].last_task_id;
  }
}
