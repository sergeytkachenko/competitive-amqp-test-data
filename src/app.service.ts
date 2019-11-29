import { Injectable } from '@nestjs/common';
import { OutboxPublisher } from './amqp/OutboxPublisher';

@Injectable()
export class AppService {
  publisher: OutboxPublisher;

  constructor(publisher: OutboxPublisher) {
    this.publisher = publisher;
  }

  main(): void {}
}
