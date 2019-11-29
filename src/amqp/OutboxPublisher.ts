import { Injectable } from '@nestjs/common';

@Injectable()
export class OutboxPublisher {

  queue: string;
  channel: any;

  constructor(channel: any, queue: string) {
    this.channel = channel;
    this.queue = queue;
  }

  send(payload: any, taskId: string): void {
    const message = {
      payload,
      taskId,
    };
    this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)));
  }
}
