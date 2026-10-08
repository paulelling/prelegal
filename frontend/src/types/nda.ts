export interface PartyInfo {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
}

export interface NDAFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: 'expires' | 'continues';
  mndaTermYears: number;
  confidentialityTermType: 'years' | 'perpetuity';
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyInfo;
  party2: PartyInfo;
}

const MNDA_TERM_TYPES = new Set<string>(['expires', 'continues']);
const CONF_TERM_TYPES = new Set<string>(['years', 'perpetuity']);

export function flatFieldsToNDA(fields: Record<string, string>): NDAFormData {
  return {
    purpose: fields.purpose ?? ndaDefaultFields.purpose,
    effectiveDate: fields.effectiveDate ?? ndaDefaultFields.effectiveDate,
    mndaTermType: MNDA_TERM_TYPES.has(fields.mndaTermType)
      ? (fields.mndaTermType as 'expires' | 'continues')
      : 'expires',
    mndaTermYears: parseInt(fields.mndaTermYears ?? '1', 10) || 1,
    confidentialityTermType: CONF_TERM_TYPES.has(fields.confidentialityTermType)
      ? (fields.confidentialityTermType as 'years' | 'perpetuity')
      : 'years',
    confidentialityTermYears: parseInt(fields.confidentialityTermYears ?? '1', 10) || 1,
    governingLaw: fields.governingLaw ?? '',
    jurisdiction: fields.jurisdiction ?? '',
    modifications: fields.modifications ?? '',
    party1: {
      name: fields.party1Name ?? '',
      title: fields.party1Title ?? '',
      company: fields.party1Company ?? '',
      noticeAddress: fields.party1NoticeAddress ?? '',
      date: fields.party1Date ?? '',
    },
    party2: {
      name: fields.party2Name ?? '',
      title: fields.party2Title ?? '',
      company: fields.party2Company ?? '',
      noticeAddress: fields.party2NoticeAddress ?? '',
      date: fields.party2Date ?? '',
    },
  };
}

// Flat string representation used for AI chat state (all document types).
// NDA uses flatFieldsToNDA to convert back to the typed NDAFormData for preview/PDF.
export const ndaDefaultFields: Record<string, string> = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: new Date().toISOString().split('T')[0],
  mndaTermType: 'expires',
  mndaTermYears: '1',
  confidentialityTermType: 'years',
  confidentialityTermYears: '1',
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
  party1Name: '',
  party1Title: '',
  party1Company: '',
  party1NoticeAddress: '',
  party1Date: '',
  party2Name: '',
  party2Title: '',
  party2Company: '',
  party2NoticeAddress: '',
  party2Date: '',
};

// Derived from ndaDefaultFields so there is a single source of truth for NDA defaults.
export const defaultFormData: NDAFormData = flatFieldsToNDA(ndaDefaultFields);

// The "Mutual NDA Cover Page" entry from catalog.json is intentionally omitted here —
// it maps to the same chat flow as "mutual-nda" and does not need a separate selector entry.
export const DOCUMENT_CATALOG = [
  { slug: 'mutual-nda', name: 'Mutual Non-Disclosure Agreement', description: 'A standard mutual NDA for protecting confidential information exchanged between two parties.' },
  { slug: 'cloud-service-agreement', name: 'Cloud Service Agreement', description: 'A comprehensive agreement for selling and buying cloud software and SaaS products.' },
  { slug: 'design-partner-agreement', name: 'Design Partner Agreement', description: 'An agreement for early product access where partners provide feedback in exchange for pre-release software.' },
  { slug: 'service-level-agreement', name: 'Service Level Agreement', description: 'A standard SLA defining uptime targets, response time commitments, and service credits.' },
  { slug: 'professional-services-agreement', name: 'Professional Services Agreement', description: 'An agreement for professional services engagements covering deliverables and payment terms.' },
  { slug: 'partnership-agreement', name: 'Partnership Agreement', description: 'A standard agreement for business partnerships covering cooperation obligations and fees.' },
  { slug: 'software-license-agreement', name: 'Software License Agreement', description: 'A comprehensive license agreement for on-premise or installable software.' },
  { slug: 'data-processing-agreement', name: 'Data Processing Agreement', description: 'A GDPR-compliant data processing agreement covering data protection obligations.' },
  { slug: 'pilot-agreement', name: 'Pilot Agreement', description: 'A short-term trial agreement allowing prospective customers to test a product.' },
  { slug: 'business-associate-agreement', name: 'Business Associate Agreement', description: 'A HIPAA-compliant agreement for business associates handling protected health information.' },
  { slug: 'ai-addendum', name: 'AI Addendum', description: 'An addendum for agreements involving AI/ML features covering ownership and restrictions.' },
] as const;

export type DocumentSlug = typeof DOCUMENT_CATALOG[number]['slug'];
