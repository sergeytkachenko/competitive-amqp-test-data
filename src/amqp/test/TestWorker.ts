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

  async onConsume(msg: any): Promise<any> {
    const randomInt = require('random-int');
    setTimeout(() => {
      const outboxMessage = JSON.parse(msg.content) as OutboxTaskMessage;
      // console.log(`outbox, id: ${this.id}`, outboxMessage.payload);
      this.gateway.brodcastAll({
        queue: outboxMessage.queue,
      });
      this.gateway.sendColor({
        worker: this.ID,
        queue: outboxMessage.queue,
      });
      const confirmMsg = {
        taskId: outboxMessage.taskId,
        queue: outboxMessage.queue,
        ns: outboxMessage.ns
      } as ConfirmTaskMessage;
      this.channel.sendToQueue('confirm1', Buffer.from(JSON.stringify(confirmMsg)));
      this.channel.ack(msg);
    }, randomInt(2, 2));

  }

}
