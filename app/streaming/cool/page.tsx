// @ts-nocheck

"use client"

import React, { useState } from "react";

const StreamingPostComponent = () => {
  const [question, setQuestion] = useState(""); // Input from user
  const [messages, setMessages] = useState<any[]>([]); // Chat history

  const handleSubmit = async () => {
    // Add the user's question to messages
    setMessages((prev) => [...prev, { user: question, bot: "" }]);

    const controller = new AbortController(); // For aborting the request if needed

    try {
      const response = await fetch("http://localhost:8000/message", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: question,
        signal: controller.signal, // Attach signal for abort
      });

      if (!response.ok) throw new Error("Failed to fetch stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        // Update the bot's response incrementally in the chat history
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]; // Get the last message
          if (lastMessage) {
            return [
              ...prev.slice(0, -1), // Keep all except the last message
              { ...lastMessage, bot: (lastMessage.bot || "") + chunk }, // Append new chunk
            ];
          }
          return prev;
        });
      }

      setQuestion(""); // Clear the input after submission
    } catch (error) {
      console.error("Error while streaming:", error);
    } finally {
      controller.abort(); // Clean up controller
    }
  };

  return (
    <div>
      <h1>Chatbot Interface</h1>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question"
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <div>
        <h2>Conversation History:</h2>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              <strong>User:</strong> {message.user}
              <br />
              <strong>Bot:</strong> {message.bot}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StreamingPostComponent;
