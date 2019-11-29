class CreateTaskConsumer {
  queue: string;
  channel: any;

  constructor(channel: any, queue: string) {
    this.channel = channel;
    this.queue = queue;
  }

}
