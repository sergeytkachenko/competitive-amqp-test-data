import { Injectable } from '@nestjs/common';
import { TaskStore } from '../task/TaskStore';
import { AbstractConsumer } from './AbstractConsumer';
import { TaskMessage } from './dto/TaskMessage';

@Injectable()
export class CreateTaskConsumer extends AbstractConsumer {

  taskStore: TaskStore;

  constructor(channel: any, queue: string, taskStore: TaskStore) {
    super(channel, queue);
    this.taskStore = taskStore;
  }

  onConsume(msg: any): void {
    const taskMessage = JSON.parse(msg.content) as TaskMessage;
    this.taskStore.push(taskMessage);
    this.channel.ack(msg);
  }

}
