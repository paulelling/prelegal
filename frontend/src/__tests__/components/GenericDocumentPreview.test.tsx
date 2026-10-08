import { render, screen } from '@testing-library/react';
import { GenericDocumentPreview } from '@/components/GenericDocumentPreview';

const DOC_NAME = 'Cloud Service Agreement';
const DOC_DESC = 'Agreement for SaaS products.';

describe('GenericDocumentPreview', () => {
  it('shows empty state when no fields are filled', () => {
    render(
      <GenericDocumentPreview
        documentName={DOC_NAME}
        documentDescription={DOC_DESC}
        formFields={{}}
      />,
    );
    expect(screen.getByText('Chat with the AI to start filling in your document fields.')).toBeInTheDocument();
  });

  it('renders document name and description', () => {
    render(
      <GenericDocumentPreview
        documentName={DOC_NAME}
        documentDescription={DOC_DESC}
        formFields={{}}
      />,
    );
    expect(screen.getByText(DOC_NAME)).toBeInTheDocument();
    expect(screen.getByText(DOC_DESC)).toBeInTheDocument();
  });

  it('renders filled field labels and values', () => {
    render(
      <GenericDocumentPreview
        documentName={DOC_NAME}
        documentDescription={DOC_DESC}
        formFields={{ providerCompany: 'Acme Inc', customerCompany: 'Beta Corp' }}
      />,
    );
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('Beta Corp')).toBeInTheDocument();
  });

  it('converts camelCase field keys to readable labels', () => {
    render(
      <GenericDocumentPreview
        documentName={DOC_NAME}
        documentDescription={DOC_DESC}
        formFields={{ providerCompany: 'Acme Inc' }}
      />,
    );
    expect(screen.getByText('Provider Company')).toBeInTheDocument();
  });

  it('shows progress counter for partially filled form', () => {
    render(
      <GenericDocumentPreview
        documentName={DOC_NAME}
        documentDescription={DOC_DESC}
        formFields={{ providerCompany: 'Acme Inc', customerCompany: '', effectiveDate: '2024-01-01' }}
      />,
    );
    expect(screen.getByText('2/3 fields')).toBeInTheDocument();
  });

  it('shows remaining fields message when some are still empty', () => {
    render(
      <GenericDocumentPreview
        documentName={DOC_NAME}
        documentDescription={DOC_DESC}
        formFields={{ providerCompany: 'Acme', customerCompany: '' }}
      />,
    );
    expect(screen.getByText(/1 field still needed/)).toBeInTheDocument();
  });

  it('uses plural for multiple remaining fields', () => {
    render(
      <GenericDocumentPreview
        documentName={DOC_NAME}
        documentDescription={DOC_DESC}
        formFields={{ a: 'filled', b: '', c: '' }}
      />,
    );
    expect(screen.getByText(/2 fields still needed/)).toBeInTheDocument();
  });

  it('does not show remaining fields message when all fields are filled', () => {
    render(
      <GenericDocumentPreview
        documentName={DOC_NAME}
        documentDescription={DOC_DESC}
        formFields={{ providerCompany: 'Acme', customerCompany: 'Beta' }}
      />,
    );
    expect(screen.queryByText(/fields still needed/)).not.toBeInTheDocument();
  });
});
