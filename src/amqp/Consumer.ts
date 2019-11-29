export interface Consumer {
  consume(queue: string): Promise<any>;
}
