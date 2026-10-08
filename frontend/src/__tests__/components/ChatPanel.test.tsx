import { useState } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
<<<<<<< HEAD
import { ChatPanel, ChatPanelProps, Message } from '@/components/ChatPanel';
import { defaultFormData } from '@/types/nda';
=======
import { ChatPanel } from '@/components/ChatPanel';
>>>>>>> origin/main

const mockFetch = jest.fn();
global.fetch = mockFetch;

const ndaFields: Record<string, string> = {
  purpose: 'Evaluating a business relationship.',
  effectiveDate: '2024-01-01',
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

function makeOkResponse(reply: string, form_updates: Record<string, unknown> = {}) {
  return {
    ok: true,
    json: async () => ({ reply, form_updates }),
  };
}

/** Wrapper that owns the messages state so tests can use ChatPanel's new controlled interface. */
function ChatPanelWrapper(
  props: Omit<ChatPanelProps, 'messages' | 'onMessagesChange' | 'token'> & { initialMessages?: Message[] },
) {
  const { initialMessages = [], ...rest } = props;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  return (
    <ChatPanel
      {...rest}
      token="test-token"
      messages={messages}
      onMessagesChange={setMessages}
    />
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ChatPanel', () => {
  it('calls /api/chat on mount to get the initial AI greeting', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse('Hello! How can I help?'));

<<<<<<< HEAD
    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={jest.fn()} />);
=======
    render(
      <ChatPanel
        documentType="mutual-nda"
        formFields={ndaFields}
        onFormUpdate={jest.fn()}
      />,
    );
>>>>>>> origin/main

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({ method: 'POST' }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument();
    });
  });

<<<<<<< HEAD
  it('sends auth header on /api/chat requests', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse('Hello!'));

    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={jest.fn()} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      );
    });
=======
  it('sends document_type in request body', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse('Hello!'));

    render(
      <ChatPanel
        documentType="cloud-service-agreement"
        formFields={{}}
        onFormUpdate={jest.fn()}
      />,
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.document_type).toBe('cloud-service-agreement');
>>>>>>> origin/main
  });

  it('shows user message and assistant reply after submitting', async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkResponse('Hello!'))
      .mockResolvedValueOnce(makeOkResponse('Great, got it!'));

<<<<<<< HEAD
    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={jest.fn()} />);
=======
    render(
      <ChatPanel
        documentType="mutual-nda"
        formFields={ndaFields}
        onFormUpdate={jest.fn()}
      />,
    );
>>>>>>> origin/main
    await waitFor(() => screen.getByText('Hello!'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'We are Acme Inc.' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('We are Acme Inc.')).toBeInTheDocument();
      expect(screen.getByText('Great, got it!')).toBeInTheDocument();
    });
  });

  it('calls onFormUpdate when AI returns flat field updates', async () => {
    const onFormUpdate = jest.fn();
    mockFetch
      .mockResolvedValueOnce(makeOkResponse('Hello!'))
      .mockResolvedValueOnce(makeOkResponse('Got it!', { governingLaw: 'Delaware' }));

<<<<<<< HEAD
    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={onFormUpdate} />);
=======
    render(
      <ChatPanel
        documentType="mutual-nda"
        formFields={ndaFields}
        onFormUpdate={onFormUpdate}
      />,
    );
>>>>>>> origin/main
    await waitFor(() => screen.getByText('Hello!'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Use Delaware law' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(onFormUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ governingLaw: 'Delaware' }),
      );
    });
  });

  it('does not call onFormUpdate when form_updates is empty', async () => {
    const onFormUpdate = jest.fn();
    mockFetch
      .mockResolvedValueOnce(makeOkResponse('Hello!'))
      .mockResolvedValueOnce(makeOkResponse('Sure, tell me more.', {}));

<<<<<<< HEAD
    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={onFormUpdate} />);
=======
    render(
      <ChatPanel
        documentType="mutual-nda"
        formFields={ndaFields}
        onFormUpdate={onFormUpdate}
      />,
    );
>>>>>>> origin/main
    await waitFor(() => screen.getByText('Hello!'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => screen.getByText('Sure, tell me more.'));
    expect(onFormUpdate).not.toHaveBeenCalled();
  });

  it('passes flat field updates directly to onFormUpdate without nested merging', async () => {
    const onFormUpdate = jest.fn();
    const fieldsWithParty = { ...ndaFields, party1Name: 'Jane', party1Title: 'CEO' };
    mockFetch
      .mockResolvedValueOnce(makeOkResponse('Hello!'))
      .mockResolvedValueOnce(
        makeOkResponse('Got it!', { party1Company: 'Acme' }),
      );

<<<<<<< HEAD
    render(<ChatPanelWrapper formData={formDataWithParty} onFormUpdate={onFormUpdate} />);
=======
    render(
      <ChatPanel
        documentType="mutual-nda"
        formFields={fieldsWithParty}
        onFormUpdate={onFormUpdate}
      />,
    );
>>>>>>> origin/main
    await waitFor(() => screen.getByText('Hello!'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Party 1 is Acme' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(onFormUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ party1Company: 'Acme' }),
      );
    });
  });

<<<<<<< HEAD
  it('skips initial greeting when loaded with existing messages', async () => {
    const existingMessages: Message[] = [
      { role: 'assistant', content: 'Loaded from history' },
    ];

    render(
      <ChatPanelWrapper
        formData={defaultFormData}
        onFormUpdate={jest.fn()}
        initialMessages={existingMessages}
      />,
    );

    expect(screen.getByText('Loaded from history')).toBeInTheDocument();
    // No fetch should be called for the greeting when messages already exist
    expect(mockFetch).not.toHaveBeenCalled();
=======
  it('refocuses the input after the AI responds', async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkResponse('Hello!'))
      .mockResolvedValueOnce(makeOkResponse('Got it!'));

    render(
      <ChatPanel
        documentType="mutual-nda"
        formFields={ndaFields}
        onFormUpdate={jest.fn()}
      />,
    );
    await waitFor(() => screen.getByText('Hello!'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello there' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => screen.getByText('Got it!'));
    expect(document.activeElement).toBe(input);
>>>>>>> origin/main
  });
});
