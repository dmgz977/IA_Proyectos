export interface IWhatsAppClient {
  initialize(): Promise<void>;
  sendMessage(to: string, message: string): Promise<void>;
  getOwnNumber(): Promise<string>;
}
