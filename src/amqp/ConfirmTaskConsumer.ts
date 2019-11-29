import { Inject, Injectable } from '@nestjs/common';
import { AbstractConsumer } from './AbstractConsumer';

@Injectable()
export class ConfirmTaskConsumer extends AbstractConsumer {

  constructor(@Inject('AMQP_CONNECT_STRING') amqpConnectionString: string, @Inject('CONFIRM') queue: string) {
    super(amqpConnectionString, queue);
  }

  onConsume(msg: any): void {
    this.channel.ack(msg);
  }

}
