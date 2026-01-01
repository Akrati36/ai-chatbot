import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_key') || '');
  const [showSettings, setShowSettings] = useState(!localStorage.getItem('openrouter_key'));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = () => {
    localStorage.setItem('openrouter_key', apiKey);
    setShowSettings(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const assistantMessage = {
          role: 'assistant',
          content: data.choices[0].message.content,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h1>🤖 AI Chatbot</h1>
          <div className="header-buttons">
            <button onClick={clearChat} className="clear-btn">Clear Chat</button>
            <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
              ⚙️
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="settings-panel">
            <h3>Settings</h3>
            <p>Get your free API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">OpenRouter</a></p>
            <input
              type="password"
              placeholder="Enter OpenRouter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="api-input"
            />
            <button onClick={saveApiKey} className="save-btn">Save API Key</button>
          </div>
        )}

        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>👋 Welcome!</h2>
              <p>Start chatting with your AI assistant</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading || !apiKey}
            className="message-input"
          />
          <button type="submit" disabled={loading || !apiKey} className="send-btn">
            {loading ? '⏳' : '📤'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;