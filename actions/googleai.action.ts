'use server'

import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatMessageHistory } from "langchain/memory"
import {
    ChatPromptTemplate,
    MessagesPlaceholder
} from "@langchain/core/prompts"
import { RunnableWithMessageHistory } from "@langchain/core/runnables"
import { createStreamableValue } from "ai/rsc"

const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-pro-latest',
    apiKey: process.env.GOOGLE_GEMINI_KEY
});

const history = new ChatMessageHistory();

const prompt = ChatPromptTemplate.fromMessages([
    ['system',
        `You are an AI chatbot having a conversation with a human. Use the following context to
        understand the human question. Do not include emojis in your answer`
    ],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
]);

const chain = prompt.pipe(llm)

const chainWithHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: sessionId => history,
    inputMessagesKey: 'input',
    historyMessagesKey: 'chat_history'
})

export const getReplay = async (message: string) => {
    const stream = createStreamableValue();

    (async () => {
        const response = await chainWithHistory.stream({
            input: message
        }, {
            configurable: {
                sessionId: "test"
            }
        });

        for await (const chunk of response) {
            stream.update(chunk.content)
        }

        stream.done();
    })();

    return { streamData: stream.value }
}

