//@ts-nocheck

"use client"

import React, { useState } from "react";

const StreamingPostComponent = () => {
  const [question, setQuestion] = useState(""); // Input from user
  const [responseChunks, setResponseChunks] = useState(""); // Streamed response

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResponseChunks((prev) => prev + decoder.decode(value));
      }
    } catch (error) {
      console.error("Error while streaming:", error);
    } finally {
      controller.abort(); // Clean up controller
    }
  };

  return (
    <div>
      <h1>Post Input Streaming</h1>
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
        <h2>Response:</h2>
        <p>{responseChunks}</p> {/* Render the streaming response */}
      </div>
    </div>
  );
};

export default StreamingPostComponent;
