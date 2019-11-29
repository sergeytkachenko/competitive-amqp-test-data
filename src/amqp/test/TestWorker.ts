import { Injectable } from '@nestjs/common';
import { AbstractConsumer } from '../AbstractConsumer';

@Injectable()
export class TestWorker extends AbstractConsumer {

  constructor(channel: any, queue: string) {
    super(channel, queue);
  }

  onConsume(msg: any): void {
    this.channel.ack(msg);
    console.log(`outbox`, msg);
  }

}
