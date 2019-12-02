import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestDataPublisher } from './amqp/test/TestDataPublisher';
import { TestWorker } from './amqp/test/TestWorker';
import { AppGateway } from './ws/AppGateway';

const connectionAmqp = 'amqp://gs:gs@tscore-dev-15:5672';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway,
    {
      provide: 'AMQP_CONNECT_STRING',
      useValue: connectionAmqp,
    },
    {
      provide: 'INBOX',
      useValue: 'inbox1',
    },
    {
      provide: 'OUTBOX',
      useValue: 'outbox1',
    },
    {
      provide: 'CONFIRM',
      useValue: 'confirm1',
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
      provide: TestDataPublisher,
      useFactory: async () => {
        const q = 'inbox1';
        const connection = await require('amqplib')
          .connect(connectionAmqp);
        const channel = await connection.createChannel();
        return new TestDataPublisher(channel, q);
      },
    }],
  exports: [AppGateway],
})
export class AppModule {
}
