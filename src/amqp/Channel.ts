export abstract class Channel {
  abstract prefetch(n: number, global: boolean): Promise<any>;
  abstract assertQueue(q: string): Promise<any>;
}
