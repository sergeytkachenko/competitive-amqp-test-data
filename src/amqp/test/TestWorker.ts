import { Injectable } from '@nestjs/common';
import { AbstractConsumer } from '../AbstractConsumer';
import { OutboxTaskMessage } from '../dto/OutboxTaskMessage';

@Injectable()
export class TestWorker extends AbstractConsumer {

  id: string;

  constructor(channel: any, queue: string, id: string) {
    super(channel, queue);
    this.id = id;
  }

  onConsume(msg: any): void {
    setTimeout(() => {
      const outboxMessage = JSON.parse(msg.content) as OutboxTaskMessage;
      console.log(`outbox, id: ${this.id}`, outboxMessage.payload);
      this.channel.ack(msg);
    }, 2000);

  }

}
