'use client';

import { NDAFormData } from '@/types/nda';
import { formatDate, getMndaTermText, getConfidentialityTermText } from '@/utils/nda';

function Placeholder({ value, fallback = '___________' }: { value: string; fallback?: string }) {
  return value ? (
    <span className="font-semibold" style={{ color: '#032147' }}>{value}</span>
  ) : (
    <span className="italic" style={{ color: '#888888' }}>{fallback}</span>
  );
}

function SignatureBlock({ party, partyNumber }: { party: NDAFormData['party1']; partyNumber: 1 | 2 }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 mt-0" style={{ color: '#888888' }}>
        Party {partyNumber}
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Company</p>
          <p className="font-medium" style={{ color: '#032147' }}><Placeholder value={party.company} /></p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Signature</p>
          <div className="border-b border-slate-300 h-8" />
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Print Name</p>
          <p><Placeholder value={party.name} /></p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Title</p>
          <p><Placeholder value={party.title} /></p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Notice Address</p>
          <p><Placeholder value={party.noticeAddress} /></p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Date</p>
          <p>{formatDate(party.date)}</p>
        </div>
      </div>
    </div>
  );
}

export function NDAPreview({ formData }: { formData: NDAFormData }) {
  const mndaTerm = getMndaTermText(formData);
  const confidentialityTerm = getConfidentialityTermText(formData);

  return (
    <div className="prose prose-slate prose-sm max-w-none text-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#032147' }}>
          Mutual Non-Disclosure Agreement
        </h1>
        <p className="text-xs" style={{ color: '#888888' }}>
          Common Paper Mutual NDA Standard Terms Version 1.0
        </p>
      </div>

      {/* Cover Page */}
      <div className="rounded-lg p-6 mb-8 border border-slate-200 bg-slate-50">
        <h2 className="text-base font-semibold mb-4 mt-0" style={{ color: '#032147' }}>Cover Page</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 mt-0" style={{ color: '#888888' }}>Purpose</h3>
            <p className="mt-0 mb-0 text-slate-700">
              <Placeholder value={formData.purpose} fallback="[How Confidential Information may be used]" />
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 mt-0" style={{ color: '#888888' }}>Effective Date</h3>
            <p className="mt-0 mb-0 text-slate-700">{formatDate(formData.effectiveDate)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 mt-0" style={{ color: '#888888' }}>MNDA Term</h3>
            <p className="mt-0 mb-0 text-slate-700">{mndaTerm}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 mt-0" style={{ color: '#888888' }}>Term of Confidentiality</h3>
            <p className="mt-0 mb-0 text-slate-700">{confidentialityTerm}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 mt-0" style={{ color: '#888888' }}>Governing Law &amp; Jurisdiction</h3>
            <p className="mt-0 mb-0 text-slate-700">
              Governing Law: <Placeholder value={formData.governingLaw} fallback="[State]" />
            </p>
            <p className="mt-1 mb-0 text-slate-700">
              Jurisdiction: <Placeholder value={formData.jurisdiction} fallback="[City/County, State]" />
            </p>
          </div>
          {formData.modifications && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 mt-0" style={{ color: '#888888' }}>Modifications</h3>
              <p className="mt-0 mb-0 text-slate-700">{formData.modifications}</p>
            </div>
          )}
        </div>
      </div>

      {/* Signature Block */}
      <div className="mb-8">
        <p className="italic mb-6 text-slate-700">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <SignatureBlock party={formData.party1} partyNumber={1} />
          <SignatureBlock party={formData.party2} partyNumber={2} />
        </div>
      </div>

      {/* Standard Terms */}
      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-base font-semibold mb-4" style={{ color: '#032147' }}>Standard Terms</h2>
        <div className="space-y-4 text-slate-700">
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>1. Introduction.</p>
            <p>
              This Mutual Non-Disclosure Agreement (&ldquo;MNDA&rdquo;) allows each party (&ldquo;Disclosing Party&rdquo;) to disclose
              or make available information in connection with the Purpose which (1) the Disclosing Party identifies to the
              receiving party (&ldquo;Receiving Party&rdquo;) as &ldquo;confidential&rdquo;, &ldquo;proprietary&rdquo;, or the like or
              (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of
              its disclosure (&ldquo;Confidential Information&rdquo;).
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>2. Use and Protection of Confidential Information.</p>
            <p>
              The Receiving Party shall: (a) use Confidential Information solely for the Purpose; (b) not disclose
              Confidential Information to third parties without the Disclosing Party&apos;s prior written approval; and
              (c) protect Confidential Information using at least the same protections the Receiving Party uses for its
              own similar information but no less than a reasonable standard of care.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>3. Exceptions.</p>
            <p>
              The Receiving Party&apos;s obligations do not apply to information that: (a) is or becomes publicly available
              through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt; (c) it
              rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed
              without using the Confidential Information.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>4. Disclosures Required by Law.</p>
            <p>
              The Receiving Party may disclose Confidential Information to the extent required by law, provided it gives
              reasonable advance notice and reasonably cooperates with the Disclosing Party&apos;s efforts to obtain
              confidential treatment.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>5. Term and Termination.</p>
            <p>
              This MNDA commences on the Effective Date and expires at the end of the MNDA Term. Either party may terminate
              upon written notice. The Receiving Party&apos;s obligations survive for the Term of Confidentiality.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>6. Return or Destruction of Confidential Information.</p>
            <p>
              Upon expiration, termination, or request, the Receiving Party will cease using and destroy or return all
              Confidential Information, confirming compliance in writing if requested.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>7. Proprietary Rights.</p>
            <p>
              The Disclosing Party retains all intellectual property rights in its Confidential Information. Disclosure
              grants no license under such rights.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>8. Disclaimer.</p>
            <p>
              ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES
              OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>9. Governing Law and Jurisdiction.</p>
            <p>
              This MNDA is governed by the laws of the State of{' '}
              <Placeholder value={formData.governingLaw} fallback="[Governing Law]" />, without regard to conflict of
              laws provisions. Legal proceedings must be instituted in{' '}
              <Placeholder value={formData.jurisdiction} fallback="[Jurisdiction]" />.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>10. Equitable Relief.</p>
            <p>
              A breach may cause irreparable harm for which monetary damages are insufficient. The Disclosing Party is
              entitled to seek equitable relief, including an injunction, in addition to other remedies.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#032147' }}>11. General.</p>
            <p>
              Neither party is obligated to disclose Confidential Information or proceed with any transaction. Neither
              party may assign this MNDA without prior written consent, except in connection with a merger or acquisition.
              This MNDA constitutes the entire agreement of the parties with respect to its subject matter.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-200 text-xs" style={{ color: '#888888' }}>
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="hover:underline" style={{ color: '#209dd7' }}>
            CC BY 4.0
          </a>.
        </div>
      </div>
    </div>
  );
}
