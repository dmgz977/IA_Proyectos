import { SendWhatsAppNotification } from '../../src/application/use-cases/send-whatsapp-notification';
import { IWhatsAppClient } from '../../src/domain/interfaces/whatsapp-client.interface';

const makeClient = (): IWhatsAppClient => ({
  initialize: jest.fn(),
  sendMessage: jest.fn().mockResolvedValue(undefined),
  getOwnNumber: jest.fn().mockResolvedValue('57300000000@c.us'),
});

describe('SendWhatsAppNotification', () => {
  test('test_should_send_message_to_own_number', async () => {
    const client = makeClient();
    const useCase = new SendWhatsAppNotification(client);
    await useCase.execute('Hola');
    expect(client.sendMessage).toHaveBeenCalledWith('57300000000@c.us', 'Hola');
  });

  test('test_should_propagate_error_when_client_throws', async () => {
    const client = makeClient();
    (client.sendMessage as jest.Mock).mockRejectedValue(new Error('WA error'));
    const useCase = new SendWhatsAppNotification(client);
    await expect(useCase.execute('Hola')).rejects.toThrow('WA error');
  });
});
