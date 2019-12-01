export class OutboxTaskMessage {
  ns: string;
  queue: string;
  taskId: string;
  payload: any;
}
