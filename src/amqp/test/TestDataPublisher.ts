import { Injectable } from '@nestjs/common';

@Injectable()
export class TestDataPublisher {

  queue: string;
  channel: any;
  queues: string[] = ['green', 'red', 'blue'];

  constructor(channel: any, queue: string) {
    this.channel = channel;
    this.queue = queue;
    this.randomData();
    //setInterval(() => this.randomData(), 60 * 1000);
  }

  randomData(): void {
    this.queues.forEach(queue => {
      for (let i = 0; i < 10  * 1000; i ++) {
        const payload = {
          date: new Date(),
          queue,
        };
        const message = {
          payload,
          queue,
        };
        this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)));
      }
    });
  }
}
