import { describe, expect, it } from 'vitest';
import { AppService } from './app.service.js';

describe('AppService', () => {
  it('should return a healthy status message', () => {
    const service = new AppService();

    expect(service.getHealth()).toBe('Inkora backend is healthy.');
  });
});
