import { Injectable } from '@nestjs/common';
import { Consumer } from './Consumer';

@Injectable()
export class ConfirmTaskConsumer implements Consumer {
  queue: string;
  channel: any;

  constructor(channel: any, queue: string) {
    this.channel = channel;
    this.queue = queue;
  }

  consume(queue: string): Promise<any> {
    return this.channel.consume(queue, (msg) => {
      if (msg !== null) {
        console.log(msg.content.toString());
        this.channel.ack(msg);
      }
    });
  }

}
