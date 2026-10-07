'use client';

import { NDAFormData, PartyInfo } from '@/types/nda';
import { parseYearsInput } from '@/utils/nda';

interface NDAFormProps {
  formData: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 pb-2 border-b border-slate-200"
          style={{ color: '#888888' }}>
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium mb-1" style={{ color: '#032147' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: '#888888' }}>{hint}</p>}
    </div>
  );
}

function PartyFields({
  party,
  partyNumber,
  onChange,
}: {
  party: PartyInfo;
  partyNumber: 1 | 2;
  onChange: (p: PartyInfo) => void;
}) {
  const update = (field: keyof PartyInfo, value: string) =>
    onChange({ ...party, [field]: value });
  const prefix = `party${partyNumber}`;

  return (
    <FormSection title={`Party ${partyNumber}`}>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Company Name" htmlFor={`${prefix}-company`}>
          <input
            id={`${prefix}-company`}
            type="text"
            value={party.company}
            onChange={(e) => update('company', e.target.value)}
            className="input-field"
            placeholder="Acme Inc."
          />
        </FormField>
        <FormField label="Signatory Name" htmlFor={`${prefix}-name`}>
          <input
            id={`${prefix}-name`}
            type="text"
            value={party.name}
            onChange={(e) => update('name', e.target.value)}
            className="input-field"
            placeholder="Jane Smith"
          />
        </FormField>
      </div>
      <FormField label="Title" htmlFor={`${prefix}-title`}>
        <input
          id={`${prefix}-title`}
          type="text"
          value={party.title}
          onChange={(e) => update('title', e.target.value)}
          className="input-field"
          placeholder="Chief Executive Officer"
        />
      </FormField>
      <FormField label="Notice Address" hint="Email or postal address for legal notices" htmlFor={`${prefix}-address`}>
        <input
          id={`${prefix}-address`}
          type="text"
          value={party.noticeAddress}
          onChange={(e) => update('noticeAddress', e.target.value)}
          className="input-field"
          placeholder="legal@company.com"
        />
      </FormField>
      <FormField label="Signature Date" htmlFor={`${prefix}-date`}>
        <input
          id={`${prefix}-date`}
          type="date"
          value={party.date}
          onChange={(e) => update('date', e.target.value)}
          className="input-field"
        />
      </FormField>
    </FormSection>
  );
}

export function NDAForm({ formData, onChange }: NDAFormProps) {
  const update = <K extends keyof NDAFormData>(field: K, value: NDAFormData[K]) =>
    onChange({ ...formData, [field]: value });

  return (
    <div className="space-y-2">
      <FormSection title="Agreement Details">
        <FormField label="Purpose" hint="How Confidential Information may be used" htmlFor="purpose">
          <textarea
            id="purpose"
            value={formData.purpose}
            onChange={(e) => update('purpose', e.target.value)}
            className="input-field min-h-[80px] resize-none"
            rows={2}
          />
        </FormField>

        <FormField label="Effective Date" htmlFor="effectiveDate">
          <input
            id="effectiveDate"
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => update('effectiveDate', e.target.value)}
            className="input-field"
          />
        </FormField>

        <FormField label="MNDA Term">
          <fieldset>
            <legend className="sr-only">MNDA Term</legend>
            <div className="space-y-2">
              <label htmlFor="mnda-expires" className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  id="mnda-expires"
                  type="radio"
                  name="mndaTermType"
                  checked={formData.mndaTermType === 'expires'}
                  onChange={() => update('mndaTermType', 'expires')}
                  className="accent-blue-600"
                />
                Expires{' '}
                <input
                  type="number"
                  min="1"
                  aria-label="MNDA term years"
                  value={formData.mndaTermYears}
                  onChange={(e) => update('mndaTermYears', parseYearsInput(e.target.value))}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                  disabled={formData.mndaTermType !== 'expires'}
                />{' '}
                year(s) from Effective Date
              </label>
              <label htmlFor="mnda-continues" className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  id="mnda-continues"
                  type="radio"
                  name="mndaTermType"
                  checked={formData.mndaTermType === 'continues'}
                  onChange={() => update('mndaTermType', 'continues')}
                  className="accent-blue-600"
                />
                Continues until terminated
              </label>
            </div>
          </fieldset>
        </FormField>

        <FormField label="Term of Confidentiality" hint="How long Confidential Information is protected">
          <fieldset>
            <legend className="sr-only">Term of Confidentiality</legend>
            <div className="space-y-2">
              <label htmlFor="conf-years" className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  id="conf-years"
                  type="radio"
                  name="confidentialityTermType"
                  checked={formData.confidentialityTermType === 'years'}
                  onChange={() => update('confidentialityTermType', 'years')}
                  className="accent-blue-600"
                />
                <input
                  type="number"
                  min="1"
                  aria-label="Confidentiality term years"
                  value={formData.confidentialityTermYears}
                  onChange={(e) => update('confidentialityTermYears', parseYearsInput(e.target.value))}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                  disabled={formData.confidentialityTermType !== 'years'}
                />{' '}
                year(s) from Effective Date (trade secrets protected longer)
              </label>
              <label htmlFor="conf-perpetuity" className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  id="conf-perpetuity"
                  type="radio"
                  name="confidentialityTermType"
                  checked={formData.confidentialityTermType === 'perpetuity'}
                  onChange={() => update('confidentialityTermType', 'perpetuity')}
                  className="accent-blue-600"
                />
                In perpetuity
              </label>
            </div>
          </fieldset>
        </FormField>
      </FormSection>

      <FormSection title="Governing Law & Jurisdiction">
        <FormField label="Governing Law" hint="State whose laws govern this agreement" htmlFor="governingLaw">
          <input
            id="governingLaw"
            type="text"
            value={formData.governingLaw}
            onChange={(e) => update('governingLaw', e.target.value)}
            className="input-field"
            placeholder="Delaware"
          />
        </FormField>
        <FormField label="Jurisdiction" hint="City/county and state for dispute resolution" htmlFor="jurisdiction">
          <input
            id="jurisdiction"
            type="text"
            value={formData.jurisdiction}
            onChange={(e) => update('jurisdiction', e.target.value)}
            className="input-field"
            placeholder="New Castle County, Delaware"
          />
        </FormField>
      </FormSection>

      <PartyFields party={formData.party1} partyNumber={1} onChange={(p) => update('party1', p)} />
      <PartyFields party={formData.party2} partyNumber={2} onChange={(p) => update('party2', p)} />

      <FormSection title="Modifications (Optional)">
        <FormField label="Additional Terms" hint="Any modifications to the standard MNDA terms" htmlFor="modifications">
          <textarea
            id="modifications"
            value={formData.modifications}
            onChange={(e) => update('modifications', e.target.value)}
            className="input-field min-h-[60px] resize-none"
            rows={2}
            placeholder="None"
          />
        </FormField>
      </FormSection>
    </div>
  );
}
