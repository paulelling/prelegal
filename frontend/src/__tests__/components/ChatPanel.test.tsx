import { useState } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChatPanel, ChatPanelProps, Message } from '@/components/ChatPanel';
import { defaultFormData } from '@/types/nda';

const mockFetch = jest.fn();
global.fetch = mockFetch;

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

    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={jest.fn()} />);

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
  });

  it('shows user message and assistant reply after submitting', async () => {
    mockFetch
      .mockResolvedValueOnce(makeOkResponse('Hello!'))
      .mockResolvedValueOnce(makeOkResponse('Great, got it!'));

    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={jest.fn()} />);
    await waitFor(() => screen.getByText('Hello!'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'We are Acme Inc.' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('We are Acme Inc.')).toBeInTheDocument();
      expect(screen.getByText('Great, got it!')).toBeInTheDocument();
    });
  });

  it('calls onFormUpdate when AI returns field updates', async () => {
    const onFormUpdate = jest.fn();
    mockFetch
      .mockResolvedValueOnce(makeOkResponse('Hello!'))
      .mockResolvedValueOnce(makeOkResponse('Got it!', { governingLaw: 'Delaware' }));

    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={onFormUpdate} />);
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

    render(<ChatPanelWrapper formData={defaultFormData} onFormUpdate={onFormUpdate} />);
    await waitFor(() => screen.getByText('Hello!'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => screen.getByText('Sure, tell me more.'));
    expect(onFormUpdate).not.toHaveBeenCalled();
  });

  it('merges party updates with existing party data', async () => {
    const onFormUpdate = jest.fn();
    const formDataWithParty = {
      ...defaultFormData,
      party1: { name: 'Jane', title: 'CEO', company: '', noticeAddress: '', date: '' },
    };
    mockFetch
      .mockResolvedValueOnce(makeOkResponse('Hello!'))
      .mockResolvedValueOnce(
        makeOkResponse('Got it!', { party1: { company: 'Acme' } }),
      );

    render(<ChatPanelWrapper formData={formDataWithParty} onFormUpdate={onFormUpdate} />);
    await waitFor(() => screen.getByText('Hello!'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Party 1 is Acme' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(onFormUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          party1: expect.objectContaining({ company: 'Acme', name: 'Jane' }),
        }),
      );
    });
  });

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
  });
});
