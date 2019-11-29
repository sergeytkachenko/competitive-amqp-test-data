import { Injectable } from '@nestjs/common';
import { InboxTaskMessage } from '../amqp/dto/InboxTaskMessage';
import { OutboxPublisher } from '../amqp/OutboxPublisher';

@Injectable()
export class TaskStore {
  outboxPublisher: OutboxPublisher;

  constructor(outboxPublisher: OutboxPublisher) {
    this.outboxPublisher = outboxPublisher;
  }

  tasks: any[] = [];

  push(task: InboxTaskMessage): void {
    this.tasks.push(task);
    // console.log(`tasks length: ${this.tasks.length}`);
    // console.log(`task.payload: ${JSON.stringify(task.payload)}`);
    // console.log(`task.queue: ${task.queue}`);
    this.outboxPublisher.send(task.payload, null);
  }
}
