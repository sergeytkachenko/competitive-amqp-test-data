import { Injectable } from '@nestjs/common';
import { TaskMessage } from '../amqp/dto/TaskMessage';

@Injectable()
export class TaskStore {

  tasks: any[] = [];

  push(task: TaskMessage): void {
    this.tasks.push(task);
    console.log(`tasks length: ${this.tasks.length}`);
    console.log(`task.payload: ${JSON.stringify(task.payload)}`);
    console.log(`task.queue: ${task.queue}`);
  }
}
