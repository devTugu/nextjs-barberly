import { describe, expect, it } from 'vitest';
import { parseOtpAuthUrl } from './parse-otpauth-url';

describe('parseOtpAuthUrl', () => {
  it('extracts account, issuer, and secret from a standard otpauth URL', () => {
    const url =
      'otpauth://totp/RE%20CMS%20Admin:admin%40example.com?secret=ABCD1234&issuer=RE%20CMS%20Admin';

    expect(parseOtpAuthUrl(url)).toEqual({
      account: 'admin@example.com',
      issuer: 'RE CMS Admin',
      secret: 'ABCD1234',
    });
  });
});
