'use client';

import { useState } from 'react';
import { ChatListed } from './ChatListed';
import { ChatBottombared } from './ChatBottombared';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chated() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text };
    const assistantMessage: Message = { role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/message', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: text,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No stream found');

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage.content += chunk;

        setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }]);
        setLoading(false)
      }
    } catch (err) {
      console.error(err);
    } finally {
   //   setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col justify-between w-full h-full overflow-hidden">
      <ChatListed messages={messages} loadingSubmit={loading} />
      <ChatBottombared onSend={sendMessage} loading={loading} />
    </div>
  );
}
