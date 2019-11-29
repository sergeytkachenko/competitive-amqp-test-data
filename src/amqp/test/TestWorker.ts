import { Inject, Injectable } from '@nestjs/common';
import { AbstractConsumer } from '../AbstractConsumer';
import { OutboxTaskMessage } from '../dto/OutboxTaskMessage';

@Injectable()
export class TestWorker extends AbstractConsumer {

  id: string;

  constructor(@Inject('AMQP_CONNECT_STRING') amqpConnectionString: string, @Inject('OUTBOX') queue: string) {
    super(amqpConnectionString, queue);
  }

  onConsume(msg: any): void {
    setTimeout(() => {
      const outboxMessage = JSON.parse(msg.content) as OutboxTaskMessage;
      console.log(`outbox, id: ${this.id}`, outboxMessage.payload);
      this.channel.ack(msg);
    }, 2000);

  }

}
