export class OutboxTaskMessage {
  queue: string;
  taskId: string;
  payload: any;
}
