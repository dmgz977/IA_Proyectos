import { loadConfig } from '../../src/shared/config';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('test_should_throw_when_required_google_credentials_are_missing', () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REFRESH_TOKEN;
    expect(() => loadConfig()).toThrow('Configuración faltante');
  });

  test('test_should_load_defaults_when_optional_env_vars_are_absent', () => {
    process.env.GOOGLE_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';
    delete process.env.SCAN_INTERVAL_MINUTES;
    delete process.env.REMINDER_MINUTES_BEFORE;
    delete process.env.TIMEZONE;

    const config = loadConfig();
    expect(config.scanIntervalMinutes).toBe(15);
    expect(config.reminderMinutesBefore).toBe(15);
    expect(config.timezone).toBe('America/Bogota');
  });

  test('test_should_load_custom_values_when_env_vars_are_set', () => {
    process.env.GOOGLE_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';
    process.env.SCAN_INTERVAL_MINUTES = '30';
    process.env.REMINDER_MINUTES_BEFORE = '10';

    const config = loadConfig();
    expect(config.scanIntervalMinutes).toBe(30);
    expect(config.reminderMinutesBefore).toBe(10);
  });
});
