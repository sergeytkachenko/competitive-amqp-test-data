import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OutboxPublisher } from './amqp/OutboxPublisher';
import { CreateTaskConsumer } from './amqp/CreateTaskConsumer';
import { ConfirmTaskConsumer } from './amqp/ConfirmTaskConsumer';
import { TestDataPublisher } from './amqp/test/TestDataPublisher';
import { TaskStore } from './task/TaskStore';
import { TestWorker } from './amqp/test/TestWorker';
import { AppGateway } from './ws/AppGateway';
import * as cassandra from 'cassandra-driver';
import { TaskRepository } from './task/TaskRepository';
import { QueueRepository } from './task/QueueRepository';
import { RedisClient } from 'redis';

const connectionAmqp = 'amqp://user:password@k8s:30403';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway,
    {
      provide: TaskRepository,
      useClass: TaskRepository,
    },
    {
      provide: QueueRepository,
      useClass: QueueRepository,
    },
    {
      provide: TaskStore,
      useClass: TaskStore,
      inject: [AppGateway],
    },
    {
      provide: RedisClient,
      useFactory: () => {
        const redis = require('redis');
        const client = redis.createClient();
        return client;
      },
    },
    {
      provide: 'AMQP_CONNECT_STRING',
      useValue: 'amqp://user:password@k8s:30403',
    },
    {
      provide: 'INBOX',
      useValue: 'inbox',
    },
    {
      provide: 'OUTBOX',
      useValue: 'outbox',
    },
    {
      provide: 'CONFIRM',
      useValue: 'confirm',
    },
    {
      provide: CreateTaskConsumer,
      useClass: CreateTaskConsumer,
    },
    {
      provide: ConfirmTaskConsumer,
      useClass: ConfirmTaskConsumer,
    },
    {
      provide: 'testWorker1',
      useClass: TestWorker,
    },
    {
      provide: 'testWorker2',
      useClass: TestWorker,
    },
    {
      provide: 'testWorker3',
      useClass: TestWorker,
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
  exports: [AppGateway],
})
export class AppModule {
}
