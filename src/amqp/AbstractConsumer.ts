import { Consumer } from './Consumer';

export abstract class AbstractConsumer implements Consumer {

  queue: string;
  channel: any;

  protected constructor(channel: any, queue: string) {
    this.channel = channel;
    this.queue = queue;
  }

  consume(queue: string): Promise<any> {
    return this.channel.consume(queue, (msg) => {
      if (msg !== null) {
        this.onConsume(msg);
      }
    });
  }

  abstract onConsume(msg: any): void;
}
