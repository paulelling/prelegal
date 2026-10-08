'use client';

interface GenericDocumentPreviewProps {
  documentName: string;
  documentDescription: string;
  formFields: Record<string, string>;
}

function fieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function GenericDocumentPreview({
  documentName,
  documentDescription,
  formFields,
}: GenericDocumentPreviewProps) {
  const filledFields = Object.entries(formFields).filter(([, v]) => v && v.trim() !== '');
  const totalFields = Object.keys(formFields).length;

  return (
    <div className="space-y-6 text-sm">
      <div className="pb-4 border-b border-slate-200">
        <h3 className="text-base font-semibold mb-1" style={{ color: '#032147' }}>
          {documentName}
        </h3>
        <p className="text-xs" style={{ color: '#888888' }}>
          {documentDescription}
        </p>
        {totalFields > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.round((filledFields.length / totalFields) * 100)}%`,
                  background: '#209dd7',
                }}
              />
            </div>
            <span className="text-xs tabular-nums" style={{ color: '#888888' }}>
              {filledFields.length}/{totalFields} fields
            </span>
          </div>
        )}
      </div>

      {filledFields.length === 0 ? (
        <p className="italic text-center py-8" style={{ color: '#888888' }}>
          Chat with the AI to start filling in your document fields.
        </p>
      ) : (
        <dl className="space-y-4">
          {filledFields.map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: '#888888' }}>
                {fieldLabel(key)}
              </dt>
              <dd className="font-medium" style={{ color: '#032147' }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {filledFields.length > 0 && filledFields.length < totalFields && (
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs italic" style={{ color: '#888888' }}>
            {totalFields - filledFields.length} field{totalFields - filledFields.length !== 1 ? 's' : ''} still needed — continue chatting to complete your document.
          </p>
        </div>
      )}
    </div>
  );
}
