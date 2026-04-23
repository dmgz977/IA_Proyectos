import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { IWhatsAppClient } from '../../domain/interfaces/whatsapp-client.interface';
import { ILogger } from '../../domain/interfaces/logger.interface';
import { AppConfig } from '../../shared/config';

export class WhatsAppWebAdapter implements IWhatsAppClient {
  private readonly client: Client;

  constructor(
    private readonly config: AppConfig,
    private readonly logger: ILogger,
  ) {
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: config.whatsappSessionPath }),
      puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    });

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      this.logger.info('[WhatsApp] Escanea el QR con tu celular para vincular la sesión');
    });

    this.client.on('ready', () => {
      this.logger.info('[WhatsApp] Cliente conectado y listo para enviar mensajes');
    });

    this.client.on('disconnected', (reason) => {
      this.logger.error(`[WhatsApp] Sesión desconectada: ${reason}`);
    });
  }

  async initialize(): Promise<void> {
    await this.client.initialize();
  }

  async getOwnNumber(): Promise<string> {
    const info = this.client.info;
    return `${info.wid.user}@c.us`;
  }

  async sendMessage(to: string, message: string): Promise<void> {
    await this.client.sendMessage(to, message);
  }
}
