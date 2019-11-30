import { Injectable } from '@nestjs/common';
import { InboxTaskMessage } from '../amqp/dto/InboxTaskMessage';
import { ConfirmTaskMessage } from '../amqp/dto/ConfirmTaskMessage';
import { OutboxPublisher } from '../amqp/OutboxPublisher';
import { OutboxTaskMessage } from '../amqp/dto/OutboxTaskMessage';

@Injectable()
export class TaskStore {
  outboxPublisher: OutboxPublisher;

  constructor(outboxPublisher: OutboxPublisher) {
    this.outboxPublisher = outboxPublisher;
    this.init();
  }

  private readonly workers: number = 3;

  tasks: any = {};
  queues: string[] = [];
  cursorQueue: number = -1;

  private init(): void {
    setInterval(() => this.nextTick(), 50);
  }

  private addQueue(queue: string): Promise<void> {
    if (this.queues.indexOf(queue) === -1) {
      this.queues.push(queue);
    }
    return Promise.resolve();
  }

  private addTask(task: InboxTaskMessage): Promise<void> {
    const queue = task.queue;
    this.tasks[queue] = this.tasks[queue] || [];
    this.tasks[queue].push(task);
    return Promise.resolve();
  }

  private shiftTask(queue: string): any {
    if (!this.tasks[queue] || this.tasks[queue].length === 0) {
      return;
    }
    return this.tasks[queue].shift();
  }

  push(task: InboxTaskMessage): void {
    this.addQueue(task.queue);
    this.addTask(task);
  }

  confirm(msg: ConfirmTaskMessage) {
    console.log(msg.taskId);
  }

  nextTick() {
    const queues = this.queues;
    if (!queues.length) {
      return;
    }
    this.cursorQueue++;
    if (queues.length <= this.cursorQueue) {
      this.cursorQueue = 0;
    }
    const queue = this.queues[this.cursorQueue];
    const task = this.shiftTask(queue);
    if (!task) {
      this.nextTick();
      return;
    }
    const outboxMsq = new OutboxTaskMessage();
    const uuid = require('uuid/v1');
    outboxMsq.taskId = uuid();
    outboxMsq.queue = queue;
    outboxMsq.payload = task.payload;
    this.outboxPublisher.send(outboxMsq);
  }
}
