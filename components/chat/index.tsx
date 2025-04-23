'use client';

import { useState } from "react";
import { readStreamableValue } from "ai/rsc";

import { getReplay } from "@/actions/googleai.action";
import { ChatList } from "./chat-list";
import { ChatBottombar } from './chat-bottombar';

export interface Message {
    role: string;
    content: string;
}

export default function Chat() {
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const sendMessage = async (newMessage: Message) => {
        setLoadingSubmit(true)
        setMessages(prevMessages => [...prevMessages, newMessage]);

        const { streamData } = await getReplay(newMessage.content);

        const reply: Message = {
            role: 'assistant',
            content: ''
        };

        setLoadingSubmit(false);
        setMessages(prevMessages => [...prevMessages, reply])

        for await (const stream of readStreamableValue(streamData)) {
            reply.content = `${reply.content}${stream}`;
            setMessages(prevMessages => {
                return [...prevMessages.slice(0, -1), reply];
            })
        }
    };

    return (
        <div className="max-w-2xl flex flex-col justify-between w-full h-full">
            <ChatList messages={messages} loadingSubmit={loadingSubmit} />
            <ChatBottombar sendMessage={sendMessage} />
        </div>
    )
}