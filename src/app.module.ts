import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OutboxPublisher } from './amqp/OutboxPublisher';
import { CreateTaskConsumer } from './amqp/CreateTaskConsumer';
import { ConfirmTaskConsumer } from './amqp/ConfirmTaskConsumer';
import { TestDataPublisher } from './amqp/test/TestDataPublisher';
import { TaskStore } from './task/TaskStore';
import { TestWorker } from './amqp/test/TestWorker';

const connectionAmqp = 'amqp://user:password@k8s:30403';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: TaskStore,
      useClass: TaskStore,
    },
    {
      provide: CreateTaskConsumer,
      useFactory: async (taskStore: TaskStore) => {
        const q = 'inbox';
        const connection = await require('amqplib')
          .connect(connectionAmqp);
        const channel = await connection.createChannel();
        await channel.assertQueue(q);
        const consumer = new CreateTaskConsumer(channel, q, taskStore);
        await consumer.consume(q);
        return consumer;
      },
      inject: [TaskStore],
    },
    {
      provide: ConfirmTaskConsumer,
      useFactory: async () => {
        const q = 'confirm';
        const connection = await require('amqplib')
          .connect(connectionAmqp);
        const channel = await connection.createChannel();
        await channel.assertQueue(q);
        const consumer = new ConfirmTaskConsumer(channel, q);
        await consumer.consume(q);
        return consumer;
      },
    },
    {
      provide: 'testWorker1',
      useFactory: async () => {
        const q = 'outbox';
        const connection = await require('amqplib')
          .connect(connectionAmqp);
        const channel = await connection.createChannel();
        await channel.prefetch(1, false);
        await channel.assertQueue(q);
        const consumer = new TestWorker(channel, q, 'testWorker1');
        await consumer.consume(q);
        return consumer;
      },
    },
    {
      provide: 'testWorker2',
      useFactory: async () => {
        const q = 'outbox';
        const connection = await require('amqplib')
          .connect(connectionAmqp);
        const channel = await connection.createChannel();
        await channel.prefetch(1, false);
        await channel.assertQueue(q);
        const consumer = new TestWorker(channel, q, 'testWorker2');
        await consumer.consume(q);
        return consumer;
      },
    },
    {
      provide: 'testWorker3',
      useFactory: async () => {
        const q = 'outbox';
        const connection = await require('amqplib')
          .connect(connectionAmqp);
        const channel = await connection.createChannel();
        await channel.prefetch(1, false);
        await channel.assertQueue(q);
        const consumer = new TestWorker(channel, q, 'testWorker3');
        await consumer.consume(q);
        return consumer;
      },
    },
    {
      provide: OutboxPublisher,
      useFactory: async () => {
        const q = 'outbox';
        const connection = await require('amqplib')
          .connect(connectionAmqp);
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
          .connect(connectionAmqp);
        const channel = await connection.createChannel();
        await channel.assertQueue(q);
        return new TestDataPublisher(channel, q);
      },
    }],
})
export class AppModule {
}
