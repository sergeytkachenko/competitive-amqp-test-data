import { Inject, Injectable } from '@nestjs/common';
import { InboxTaskMessage } from '../amqp/dto/InboxTaskMessage';

@Injectable()
export class TaskRepository {

  private taskTables: string[] = [];

  constructor(@Inject('CASSANDRA_CLIENT') private readonly cassandraClient: any) {
    this.init();
  }

  private async init(): Promise<any> {
    await this.actualiseTaskTables();
  }

  private async addTaskTableIfNotExists(queue: string): Promise<any> {
    if (this.taskTables.indexOf(`task_${queue}`) !== -1) {
      return Promise.resolve();
    }
    const query = `
        CREATE TABLE IF NOT EXISTS task_${queue} (
        id timeuuid,
        queue text,
        payload text,
        PRIMARY KEY (id)
    );`;
    await this.cassandraClient.execute(query);
    this.taskTables.push(`task_${queue}`);
  }

  private async actualiseTaskTables(): Promise<any> {
    const query = 'SELECT * FROM queue;';
    const result = await this.cassandraClient.execute(query);
    const tables = result.rows;
    const names = Array.from(tables).map(t => `task_${(t as any).name}`);
    if (names && names.length) {
      this.taskTables = names;
    }
  }

  async addTask(task: InboxTaskMessage): Promise<void> {
    await this.addTaskTableIfNotExists(task.queue);
    const query = `INSERT INTO task_${task.queue} (id, queue, payload) VALUES (now(), '${task.queue}', '');`;
    await this.cassandraClient.execute(query);
    return Promise.resolve();
  }

  async getNextTaskByLastTaskId(lastTaskId: string, queue: string): Promise<any> {
    if (this.taskTables.indexOf(`task_${queue}`) === -1) {
      return Promise.resolve(null);
    }
    const query = `SELECT * FROM task_${queue} WHERE token(id) > token(?) LIMIT 1;`;
    const result = await this.cassandraClient.execute(query, [ lastTaskId ]);
    return result.rows[0];
  }
}
