import { IWhatsAppClient } from '../../domain/interfaces/whatsapp-client.interface';

export class SendWhatsAppNotification {
  constructor(private readonly whatsappClient: IWhatsAppClient) {}

  async execute(message: string): Promise<void> {
    const ownNumber = await this.whatsappClient.getOwnNumber();
    await this.whatsappClient.sendMessage(ownNumber, message);
  }
}
