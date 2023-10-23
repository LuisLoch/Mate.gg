import React, { useState } from 'react';
import './Chat.css';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chat-component ${isOpen ? 'open' : 'closed'}`}>
      {isOpen ? (
        <div className="chat-window">
          {/* Aqui você pode adicionar a lista de conversas do usuário */}
          <ul className="chat-list">
            {/* Exemplo de item de conversa */}
            <li className="chat-item">Conversa 1</li>
            <li className="chat-item">Conversa 2</li>
            <li className="chat-item">Conversa 3</li>
            {/* Adicione mais itens de conversa conforme necessário */}
          </ul>
        </div>
      ) : (
        <button className="chat-button" onClick={toggleChat}>
          Chat
        </button>
      )}
    </div>
  );
};

export default Chat;
