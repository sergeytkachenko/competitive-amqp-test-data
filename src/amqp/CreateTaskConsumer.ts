import { Inject, Injectable } from '@nestjs/common';
import { TaskStore } from '../task/TaskStore';
import { AbstractConsumer } from './AbstractConsumer';
import { InboxTaskMessage } from './dto/InboxTaskMessage';

@Injectable()
export class CreateTaskConsumer extends AbstractConsumer {

  taskStore: TaskStore;

  constructor(@Inject('AMQP_CONNECT_STRING') amqpConnectionString: string, @Inject('INBOX') queue: string, taskStore: TaskStore) {
    super(amqpConnectionString, queue, 1000);
    this.taskStore = taskStore;
  }

  onConsume(msg: any): void {
    const taskMessage = JSON.parse(msg.content) as InboxTaskMessage;
    this.taskStore.push(taskMessage);
    this.channel.ack(msg);
  }

}
