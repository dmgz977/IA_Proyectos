import { FetchUpcomingEvents } from '../../src/application/use-cases/fetch-upcoming-events';
import { CalendarEvent } from '../../src/domain/entities/calendar-event';
import { ICalendarRepository } from '../../src/domain/interfaces/calendar-repository.interface';
import { ILogger } from '../../src/domain/interfaces/logger.interface';

const makeEvent = (startTime: Date): CalendarEvent =>
  new CalendarEvent('evt-1', 'Reunión', startTime, null, []);

const mockLogger: ILogger = { info: jest.fn(), error: jest.fn() };

describe('FetchUpcomingEvents', () => {
  test('test_should_return_notifiable_events_when_repository_returns_events', async () => {
    const timedEvent = makeEvent(new Date('2026-04-22T15:00:00Z'));
    const allDayEvent = makeEvent(new Date('2026-04-22T00:00:00Z'));
    const repo: ICalendarRepository = { getUpcomingEvents: jest.fn().mockResolvedValue([timedEvent, allDayEvent]) };

    const useCase = new FetchUpcomingEvents(repo, mockLogger);
    const result = await useCase.execute(2);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(timedEvent);
  });

  test('test_should_return_empty_when_repository_returns_no_events', async () => {
    const repo: ICalendarRepository = { getUpcomingEvents: jest.fn().mockResolvedValue([]) };
    const useCase = new FetchUpcomingEvents(repo, mockLogger);
    const result = await useCase.execute(2);
    expect(result).toHaveLength(0);
  });

  test('test_should_propagate_error_when_repository_throws', async () => {
    const repo: ICalendarRepository = {
      getUpcomingEvents: jest.fn().mockRejectedValue(new Error('API error')),
    };
    const useCase = new FetchUpcomingEvents(repo, mockLogger);
    await expect(useCase.execute(2)).rejects.toThrow('API error');
  });
});
