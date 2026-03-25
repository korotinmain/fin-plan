import { calcProgressPercent, calcRemaining } from './goal.helpers';

describe('calcRemaining', () => {
  it('returns (target - saved) when saved is less than target', () => {
    expect(calcRemaining(250_000, 80_000)).toBe(170_000);
  });

  it('returns 0 when saved equals target', () => {
    expect(calcRemaining(100_000, 100_000)).toBe(0);
  });

  it('returns 0 when saved exceeds target (no negative remaining)', () => {
    expect(calcRemaining(100_000, 120_000)).toBe(0);
  });

  it('returns full target when saved is 0', () => {
    expect(calcRemaining(250_000, 0)).toBe(250_000);
  });
});

describe('calcProgressPercent', () => {
  it('returns 0 when targetAmount is 0', () => {
    expect(calcProgressPercent(0, 50_000)).toBe(0);
  });

  it('returns 0 when targetAmount is negative', () => {
    expect(calcProgressPercent(-1, 50_000)).toBe(0);
  });

  it('returns 0 when savedAmount is 0', () => {
    expect(calcProgressPercent(250_000, 0)).toBe(0);
  });

  it('calculates correct percentage', () => {
    expect(calcProgressPercent(200_000, 50_000)).toBe(25);
  });

  it('rounds to the nearest integer', () => {
    expect(calcProgressPercent(300_000, 100_000)).toBe(33);
  });

  it('returns 100 when saved equals target', () => {
    expect(calcProgressPercent(100_000, 100_000)).toBe(100);
  });

  it('caps at 100 when saved exceeds target', () => {
    expect(calcProgressPercent(100_000, 150_000)).toBe(100);
  });
});
