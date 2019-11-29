import { Injectable } from '@nestjs/common';
import { InboxTaskMessage } from '../amqp/dto/InboxTaskMessage';
import { OutboxPublisher } from '../amqp/OutboxPublisher';
import { AppGateway } from '../ws/AppGateway';

@Injectable()
export class TaskStore {
  outboxPublisher: OutboxPublisher;

  constructor(outboxPublisher: OutboxPublisher,
              private readonly gateway: AppGateway) {
    this.outboxPublisher = outboxPublisher;
  }

  tasks: any[] = [];

  push(task: InboxTaskMessage): void {
    this.tasks.push(task);
    // console.log(`tasks length: ${this.tasks.length}`);
    // console.log(`task.payload: ${JSON.stringify(task.payload)}`);
    // console.log(`task.queue: ${task.queue}`);
    this.gateway.brodcastAll(task.payload);
    this.outboxPublisher.send(task.payload, null);
  }
}
