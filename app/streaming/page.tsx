//@ts-nocheck

"use client"

import { useState } from "react";

const StreamingPostComponent = () => {
    const [question, setQuestion] = useState(""); // Input from user
    const [responseChunks, setResponseChunks] = useState(""); // Streamed response (temporary)
    const [messages, setMessages] = useState<any[]>([]); // Chat history (array of user-message pairs)
  
    const handleSubmit = async () => {
      setResponseChunks(""); // Clear previous response
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
        let fullResponse = ""; // Temporary variable to store the full streamed message
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setResponseChunks((prev) => prev + chunk); // Update streaming response incrementally
        }
  
        // Add the complete user-question and AI-response to the chat history
        setMessages((prev) => [
          ...prev,
          { user: question, bot: fullResponse },
        ]);
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
        <div>
          <h2>Current Response:</h2>
          <p>{responseChunks}</p> {/* Render the streaming response in real time */}
        </div>
      </div>
    );
  };
  
  export default StreamingPostComponent;
  