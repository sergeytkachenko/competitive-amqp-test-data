import { Injectable } from '@nestjs/common';
import { InboxTaskMessage } from '../amqp/dto/InboxTaskMessage';
import { ConfirmTaskMessage } from '../amqp/dto/ConfirmTaskMessage';
import { OutboxPublisher } from '../amqp/OutboxPublisher';
import { OutboxTaskMessage } from '../amqp/dto/OutboxTaskMessage';
import { TaskRepository } from './TaskRepository';
import { QueueRepository } from './QueueRepository';

@Injectable()
export class TaskStore {
  outboxPublisher: OutboxPublisher;

  constructor(outboxPublisher: OutboxPublisher,
              private readonly taskRepository: TaskRepository,
              private readonly queueRepository: QueueRepository) {
    this.outboxPublisher = outboxPublisher;
    this.init();
  }

  private readonly workers: number = 3;

  cursorQueue: number = -1;
  inProcessTasks: number = 0;

  private init(): void {
    setInterval(() => this.nextTick(), 15);
  }

  private async addQueue(queue: string): Promise<void> {
    return this.queueRepository.addQueueNotExists(queue);
  }

  private async addTask(task: InboxTaskMessage): Promise<void> {
    return this.taskRepository.addTask(task);
  }

  private async shiftTask(queue: string): Promise<any> {
    return this.taskRepository.getNextTask(queue);
  }

  async push(task: InboxTaskMessage): Promise<any> {
    await this.addTask(task);
    await this.addQueue(task.queue);
  }

  async confirm(msg: ConfirmTaskMessage): Promise<void> {
    this.inProcessTasks--;
  }

  async nextTick(): Promise<void> {
    if (this.inProcessTasks > this.workers * 5) {
      return;
    }
    const queues = this.queueRepository.getQueues();
    if (!queues.length) {
      return;
    }
    this.cursorQueue++;
    if (queues.length <= this.cursorQueue) {
      this.cursorQueue = 0;
    }
    const queue = queues[this.cursorQueue];
    const task = await this.shiftTask(queue);
    if (!task) {
      return;
    }
    const outboxMsq = new OutboxTaskMessage();
    outboxMsq.taskId = task.id;
    outboxMsq.queue = queue;
    outboxMsq.payload = task.payload;
    this.outboxPublisher.send(outboxMsq);
    this.inProcessTasks++;
  }
}
