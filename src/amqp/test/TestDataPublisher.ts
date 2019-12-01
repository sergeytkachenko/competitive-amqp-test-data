import { Injectable } from '@nestjs/common';

@Injectable()
export class TestDataPublisher {

  queue: string;
  channel: any;
  queues: string[] = ['red', 'green', 'blue', 'yellow', 'magenta'];
  queuesCount: any = {
    red: 15 * 1000,
    green: 1800,
    blue: 1300,
    yellow: 1500,
    magenta: 2600,
  };

  constructor(channel: any, queue: string) {
    this.channel = channel;
    this.queue = queue;
    setTimeout(() => this.randomData(), 10 * 1000);
  }

  randomData(): void {
    this.queues.forEach((queue, index) => {
      setTimeout(() => {
        for (let i = 0; i < this.queuesCount[queue]; i ++) {
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
      }, 1);
    });
  }
}
