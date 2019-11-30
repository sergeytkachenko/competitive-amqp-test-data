import { Inject, Injectable } from '@nestjs/common';
import { AbstractConsumer } from './AbstractConsumer';
import { TaskStore } from '../task/TaskStore';
import { ConfirmTaskMessage } from './dto/ConfirmTaskMessage';

@Injectable()
export class ConfirmTaskConsumer extends AbstractConsumer {

  constructor(@Inject('AMQP_CONNECT_STRING') amqpConnectionString: string,
              @Inject('CONFIRM') queue: string,
              private readonly taskStore: TaskStore) {
    super(amqpConnectionString, queue);
  }

  onConsume(msg: any): void {
    const massage = JSON.parse(msg.content) as ConfirmTaskMessage;
    this.taskStore.confirm(massage);
    this.channel.ack(msg);
  }

}
