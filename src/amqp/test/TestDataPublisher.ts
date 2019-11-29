import { Injectable } from '@nestjs/common';

@Injectable()
export class Publisher {

  queue: string;
  channel: any;

  constructor(channel: any, queue: string) {
    this.channel = channel;
    this.queue = queue;
  }

  send(payload: any): void {
    this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(payload)));
  }
}
