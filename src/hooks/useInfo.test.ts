import { describe, expect, it } from 'vitest';
import { parseOpeningTime } from './useInfo';

// The admin edits opening hours as two fields (days, time) that are stored as one string
describe('parseOpeningTime', () => {
  it.each([
    ['Sunday — Thursday 9:00 AM — 7:00 PM', 'Sunday — Thursday', '9:00 AM — 7:00 PM'],
    ['السبت — الخميس 9:00 صباحًا — 7:00 مساءً', 'السبت — الخميس', '9:00 صباحًا — 7:00 مساءً'],
    ['ראשון — חמישי 10:00 — 18:00', 'ראשון — חמישי', '10:00 — 18:00'],
    ['Daily 8:30am — 5:00pm', 'Daily', '8:30am — 5:00pm'],
  ])('splits %s', (input, days, time) => {
    expect(parseOpeningTime(input)).toEqual({ days, time });
  });

  it('keeps free text without a time range as the days part', () => {
    expect(parseOpeningTime('Closed for holidays')).toEqual({
      days: 'Closed for holidays',
      time: '',
    });
    expect(parseOpeningTime('')).toEqual({ days: '', time: '' });
  });
});
