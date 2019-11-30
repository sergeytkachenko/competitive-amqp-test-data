import { Consumer } from './Consumer';

export abstract class AbstractConsumer implements Consumer {

  amqpConnectionString: string;
  queue: string;
  channel: any;
  prefetchCount: number;

  protected constructor(amqpConnectionString: string, queue: string, prefetchCount: number = 1) {
    this.amqpConnectionString = amqpConnectionString;
    this.queue = queue;
    this.prefetchCount = prefetchCount;
    this.init();
  }

  async init(): Promise<any> {
    const connection = await require('amqplib')
      .connect(this.amqpConnectionString);
    const channel = await connection.createChannel();
    await channel.prefetch(this.prefetchCount, false);
    this.channel = channel;
    await this.channel.deleteQueue(this.queue, {ifEmpty: false});
    this.channel.assertQueue(this.queue)
      .then(() => this.consume(this.queue));
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
