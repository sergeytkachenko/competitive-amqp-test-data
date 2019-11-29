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

const connectionAmqp = 'amqp://user:password@k8s:30403';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway,
    {
      provide: TaskStore,
      useClass: TaskStore,
      inject: [AppGateway],
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
