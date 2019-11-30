import { Inject, Injectable } from '@nestjs/common';
import { TaskStore } from '../task/TaskStore';
import { AbstractConsumer } from './AbstractConsumer';
import { InboxTaskMessage } from './dto/InboxTaskMessage';

@Injectable()
export class CreateTaskConsumer extends AbstractConsumer {

  taskStore: TaskStore;

  constructor(@Inject('AMQP_CONNECT_STRING') amqpConnectionString: string,
              @Inject('INBOX') queue: string,
              taskStore: TaskStore) {
    super(amqpConnectionString, queue, 250);
    this.taskStore = taskStore;
  }

  async onConsume(msg: any): Promise<any> {
    const taskMessage = JSON.parse(msg.content) as InboxTaskMessage;
    const now = new Date();
    await this.taskStore.push(taskMessage);
    // @ts-ignore
    console.log((new Date() - now));
    this.channel.ack(msg);
  }

}
