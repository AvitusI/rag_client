import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { Message } from './Chated';

interface ChatBottombarProps {
  onSend: (content: string) => void;
  loading: boolean;
}

export function ChatBottombared({ onSend, loading }: ChatBottombarProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="p-4 flex justify-between w-full items-center gap-2">
      <form onSubmit={handleSubmit} className="w-full items-center flex relative gap-2">
        <TextareaAutosize
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="border-input max-h-20 px-5 py-4 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full border rounded-full flex items-center h-14 resize-none overflow-hidden"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md h-14 w-14"
          disabled={loading}
        >
          <PaperPlaneIcon />
        </button>
      </form>
    </div>
  );
}
