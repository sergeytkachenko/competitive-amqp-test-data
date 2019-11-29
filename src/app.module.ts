import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OutboxPublisher } from './amqp/OutboxPublisher';
import { CreateTaskConsumer } from './amqp/CreateTaskConsumer';
import { ConfirmTaskConsumer } from './amqp/ConfirmTaskConsumer';
import { TestDataPublisher } from './amqp/test/TestDataPublisher';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: CreateTaskConsumer,
      useFactory: async () => {
        const q = 'inbox';
        const connection = await require('amqplib')
          .connect('amqp://rabbitmq:rabbitmq@localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(q);
        const consumer = new CreateTaskConsumer(channel, q);
        await consumer.consume(q);
        return consumer;
      },
    },
    {
      provide: ConfirmTaskConsumer,
      useFactory: async () => {
        const q = 'confirm';
        const connection = await require('amqplib')
          .connect('amqp://rabbitmq:rabbitmq@localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(q);
        const consumer = new ConfirmTaskConsumer(channel, q);
        await consumer.consume(q);
        return consumer;
      },
    },
    {
      provide: OutboxPublisher,
      useFactory: async () => {
        const q = 'outbox';
        const connection = await require('amqplib')
          .connect('amqp://rabbitmq:rabbitmq@localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(q);
        return new OutboxPublisher(channel, q);
      },
    },
    {
      provide: TestDataPublisher,
      useFactory: async () => {
        const q = 'inbox';
        const connection = await require('amqplib')
          .connect('amqp://rabbitmq:rabbitmq@localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(q);
        return new TestDataPublisher(channel, q);
      },
    }],
})
export class AppModule {
}
