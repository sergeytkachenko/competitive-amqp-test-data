import { Inject, Injectable } from '@nestjs/common';
import { AbstractConsumer } from '../AbstractConsumer';
import { OutboxTaskMessage } from '../dto/OutboxTaskMessage';
import { AppGateway } from '../../ws/AppGateway';
import { ConfirmTaskMessage } from '../dto/ConfirmTaskMessage';

@Injectable()
export class TestWorker extends AbstractConsumer {

  static id: number;
  private readonly ID: number;

  constructor(@Inject('AMQP_CONNECT_STRING') amqpConnectionString: string,
              @Inject('OUTBOX') queue: string,
              private readonly gateway: AppGateway) {
    super(amqpConnectionString, queue);
    TestWorker.id = TestWorker.id ? TestWorker.id + 1 : 1;
    this.ID = TestWorker.id;
  }

  onConsume(msg: any): void {
    const randomInt = require('random-int');
    setTimeout(() => {
      const outboxMessage = JSON.parse(msg.content) as OutboxTaskMessage;
      // console.log(`outbox, id: ${this.id}`, outboxMessage.payload);
      this.channel.ack(msg);
      this.gateway.brodcastAll(outboxMessage.payload);
      this.gateway.sendColor({
        worker: this.ID,
        queue: outboxMessage.payload.queue,
      });
      const confirmMsg = new ConfirmTaskMessage();
      confirmMsg.taskId = outboxMessage.taskId;
      confirmMsg.queue = outboxMessage.queue;
      this.channel.sendToQueue('confirm', Buffer.from(JSON.stringify(confirmMsg)));
    }, randomInt(20, 30));

  }

}
