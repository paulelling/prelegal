import {
  formatDate,
  getMndaTermText,
  getConfidentialityTermText,
  generateNdaFilename,
  sanitizeFilename,
  placeholder,
  parseYearsInput,
} from '@/utils/nda';
import { defaultFormData } from '@/types/nda';

describe('formatDate', () => {
  it('returns placeholder for empty string', () => {
    expect(formatDate('')).toBe('___________');
  });

  it('formats a date correctly', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024');
  });

  it('handles end-of-month dates without timezone shift', () => {
    expect(formatDate('2024-03-31')).toBe('March 31, 2024');
  });
});

describe('getMndaTermText', () => {
  it('returns expires text for expires type', () => {
    const data = { ...defaultFormData, mndaTermType: 'expires' as const, mndaTermYears: 2 };
    expect(getMndaTermText(data)).toBe('Expires 2 year(s) from Effective Date.');
  });

  it('returns continues text for continues type', () => {
    const data = { ...defaultFormData, mndaTermType: 'continues' as const };
    expect(getMndaTermText(data)).toContain('Continues until terminated');
  });
});

describe('getConfidentialityTermText', () => {
  it('returns years text', () => {
    const data = { ...defaultFormData, confidentialityTermType: 'years' as const, confidentialityTermYears: 3 };
    expect(getConfidentialityTermText(data)).toContain('3 year(s)');
  });

  it('returns perpetuity text', () => {
    const data = { ...defaultFormData, confidentialityTermType: 'perpetuity' as const };
    expect(getConfidentialityTermText(data)).toBe('In perpetuity.');
  });
});

describe('sanitizeFilename', () => {
  it('replaces special characters', () => {
    expect(sanitizeFilename('Acme Corp. Ltd!')).toBe('Acme_Corp__Ltd_');
  });

  it('truncates to 50 chars', () => {
    expect(sanitizeFilename('a'.repeat(60))).toHaveLength(50);
  });
});

describe('generateNdaFilename', () => {
  it('uses company names and effective date', () => {
    const data = { ...defaultFormData, party1: { ...defaultFormData.party1, company: 'Acme' }, party2: { ...defaultFormData.party2, company: 'Beta' }, effectiveDate: '2024-06-01' };
    expect(generateNdaFilename(data)).toBe('Mutual-NDA_Acme_Beta_2024-06-01.pdf');
  });

  it('falls back to Party1/Party2 when companies are empty', () => {
    const data = { ...defaultFormData, effectiveDate: '2024-01-01' };
    expect(generateNdaFilename(data)).toBe('Mutual-NDA_Party1_Party2_2024-01-01.pdf');
  });
});

describe('placeholder', () => {
  it('returns value when present', () => {
    expect(placeholder('Delaware')).toBe('Delaware');
  });

  it('returns fallback when empty', () => {
    expect(placeholder('')).toBe('___________');
    expect(placeholder('', '[State]')).toBe('[State]');
  });
});

describe('parseYearsInput', () => {
  it('parses valid numbers', () => {
    expect(parseYearsInput('3')).toBe(3);
  });

  it('clamps to minimum of 1', () => {
    expect(parseYearsInput('0')).toBe(1);
    expect(parseYearsInput('-5')).toBe(1);
  });

  it('returns 1 for empty string', () => {
    expect(parseYearsInput('')).toBe(1);
  });

  it('returns 1 for non-numeric input', () => {
    expect(parseYearsInput('abc')).toBe(1);
  });
});
