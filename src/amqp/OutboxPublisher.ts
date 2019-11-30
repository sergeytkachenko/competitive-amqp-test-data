import { Injectable } from '@nestjs/common';
import { OutboxTaskMessage } from './dto/OutboxTaskMessage';

@Injectable()
export class OutboxPublisher {

  queue: string;
  channel: any;

  constructor(channel: any, queue: string) {
    this.channel = channel;
    this.queue = queue;
  }

  send(message: OutboxTaskMessage): void {
    const msg = Buffer.from(JSON.stringify(message));
    this.channel.sendToQueue(this.queue, msg);
  }
}
