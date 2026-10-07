'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { NDAFormData } from '@/types/nda';
import { formatDate, getMndaTermText, getConfidentialityTermText, placeholder } from '@/utils/nda';

const styles = StyleSheet.create({
  page: { padding: 50, fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.5 },
  header: { textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 5 },
  subtitle: { fontSize: 9, color: '#888888' },
  coverPage: { backgroundColor: '#f8fafc', padding: 15, marginBottom: 20 },
  coverPageTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 10, color: '#032147' },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#888888', textTransform: 'uppercase', marginBottom: 3, marginTop: 8 },
  text: { fontSize: 10, color: '#334155', marginBottom: 5 },
  signatureGrid: { flexDirection: 'row', gap: 20, marginTop: 15, marginBottom: 20 },
  signatureBox: { flex: 1, border: '1 solid #e2e8f0', padding: 12 },
  signatureLabel: { fontSize: 8, color: '#888888', marginBottom: 2 },
  signatureValue: { fontSize: 10, color: '#032147', marginBottom: 8 },
  signatureLine: { borderBottom: '1 solid #cbd5e1', height: 20, marginBottom: 8 },
  termsTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 10, color: '#032147' },
  termSection: { marginBottom: 10 },
  termTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 3, color: '#032147' },
  termText: { fontSize: 9, color: '#475569', textAlign: 'justify' },
  italic: { fontStyle: 'italic', color: '#475569', marginBottom: 10 },
  footer: { marginTop: 20, paddingTop: 10, borderTop: '1 solid #e2e8f0', fontSize: 8, color: '#888888' },
});

function PartySignature({ party, partyNumber }: { party: NDAFormData['party1']; partyNumber: 1 | 2 }) {
  return (
    <View style={styles.signatureBox}>
      <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Party {partyNumber}</Text>
      <Text style={styles.signatureLabel}>Company</Text>
      <Text style={styles.signatureValue}>{placeholder(party.company)}</Text>
      <Text style={styles.signatureLabel}>Signature</Text>
      <View style={styles.signatureLine} />
      <Text style={styles.signatureLabel}>Print Name</Text>
      <Text style={styles.signatureValue}>{placeholder(party.name)}</Text>
      <Text style={styles.signatureLabel}>Title</Text>
      <Text style={styles.signatureValue}>{placeholder(party.title)}</Text>
      <Text style={styles.signatureLabel}>Notice Address</Text>
      <Text style={styles.signatureValue}>{placeholder(party.noticeAddress)}</Text>
      <Text style={styles.signatureLabel}>Date</Text>
      <Text style={styles.signatureValue}>{formatDate(party.date)}</Text>
    </View>
  );
}

export function NDAPdf({ formData }: { formData: NDAFormData }) {
  const mndaTerm = getMndaTermText(formData);
  const confidentialityTerm = getConfidentialityTermText(formData);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>
          <Text style={styles.subtitle}>Common Paper Mutual NDA Standard Terms Version 1.0</Text>
        </View>

        <View style={styles.coverPage}>
          <Text style={styles.coverPageTitle}>Cover Page</Text>
          <Text style={styles.sectionTitle}>Purpose</Text>
          <Text style={styles.text}>{placeholder(formData.purpose, '[How Confidential Information may be used]')}</Text>
          <Text style={styles.sectionTitle}>Effective Date</Text>
          <Text style={styles.text}>{formatDate(formData.effectiveDate)}</Text>
          <Text style={styles.sectionTitle}>MNDA Term</Text>
          <Text style={styles.text}>{mndaTerm}</Text>
          <Text style={styles.sectionTitle}>Term of Confidentiality</Text>
          <Text style={styles.text}>{confidentialityTerm}</Text>
          <Text style={styles.sectionTitle}>Governing Law & Jurisdiction</Text>
          <Text style={styles.text}>Governing Law: {placeholder(formData.governingLaw, '[State]')}</Text>
          <Text style={styles.text}>Jurisdiction: {placeholder(formData.jurisdiction, '[City/County, State]')}</Text>
          {formData.modifications ? (
            <>
              <Text style={styles.sectionTitle}>Modifications</Text>
              <Text style={styles.text}>{formData.modifications}</Text>
            </>
          ) : null}
        </View>

        <Text style={styles.italic}>
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </Text>

        <View style={styles.signatureGrid}>
          <PartySignature party={formData.party1} partyNumber={1} />
          <PartySignature party={formData.party2} partyNumber={2} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.termsTitle}>Standard Terms</Text>

        {[
          ['1. Introduction.', 'This Mutual Non-Disclosure Agreement ("MNDA") allows each party ("Disclosing Party") to disclose or make available information in connection with the Purpose which (1) the Disclosing Party identifies to the receiving party ("Receiving Party") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("Confidential Information").'],
          ['2. Use and Protection of Confidential Information.', 'The Receiving Party shall: (a) use Confidential Information solely for the Purpose; (b) not disclose Confidential Information to third parties without prior written approval; and (c) protect Confidential Information using at least the same protections it uses for its own similar information but no less than a reasonable standard of care.'],
          ['3. Exceptions.', "The Receiving Party's obligations do not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt; (c) it rightfully obtained from a third party without restrictions; or (d) it independently developed without using the Confidential Information."],
          ['4. Disclosures Required by Law.', 'The Receiving Party may disclose Confidential Information to the extent required by law, provided it gives reasonable advance notice and cooperates with efforts to obtain confidential treatment.'],
          ['5. Term and Termination.', `This MNDA commences on the Effective Date and expires at the end of the MNDA Term. Either party may terminate upon written notice. Confidentiality obligations survive for the Term of Confidentiality.`],
          ['6. Return or Destruction of Confidential Information.', 'Upon expiration, termination, or request, the Receiving Party will cease using and destroy or return all Confidential Information, confirming compliance in writing if requested.'],
          ['7. Proprietary Rights.', 'The Disclosing Party retains all intellectual property rights in its Confidential Information. Disclosure grants no license under such rights.'],
          ['8. Disclaimer.', 'ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.'],
          ['9. Governing Law and Jurisdiction.', `This MNDA is governed by the laws of the State of ${placeholder(formData.governingLaw, '[Governing Law]')}, without regard to conflict of laws provisions. Legal proceedings must be instituted in ${placeholder(formData.jurisdiction, '[Jurisdiction]')}.`],
          ['10. Equitable Relief.', 'A breach may cause irreparable harm for which monetary damages are insufficient. The Disclosing Party is entitled to seek equitable relief, including an injunction, in addition to other remedies.'],
          ['11. General.', 'Neither party is obligated to disclose Confidential Information or proceed with any transaction. Neither party may assign this MNDA without prior written consent, except in connection with a merger or acquisition. This MNDA constitutes the entire agreement of the parties.'],
        ].map(([title, text]) => (
          <View key={title} style={styles.termSection}>
            <Text style={styles.termTitle}>{title}</Text>
            <Text style={styles.termText}>{text}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text>Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0.</Text>
        </View>
      </Page>
    </Document>
  );
}
