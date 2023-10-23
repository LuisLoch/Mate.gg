import React, { useEffect, useState } from 'react';
import './Chat.css';

import { BsX, BsChatDots } from 'react-icons/bs'

import { useSelector, useDispatch } from 'react-redux';

const Chat = () => {
  const dispatch = useDispatch();

  const { chat } = useSelector((state) => state.chat)

  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(1);
  const [chatMessages, setChatMessages] = useState(null);

  useEffect(() => {
    if(chat) {
      setChatMessages(chat);
      //implementar a setagem de unreadMessagesCount
    }
  }, [chat]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div id='chat-component' className={`${isOpen ? 'open' : 'closed'}`}>
      {isOpen ? (
        <div id="chat-window">
          <button id="chat-close-button" onClick={toggleChat}>
            <BsX/>
          </button>
          <div id='chat-list'>
            <ul id='chat-players'>
              <li className="chat-item">Player 1</li>
              <li className="chat-item">Player 2</li>
              <li className="chat-item">Player 3</li>
            </ul>
            <ul id="chat-messages">
              <li className="chat-item">Conversa 1</li>
              <li className="chat-item">Conversa 2</li>
              <li className="chat-item">Conversa 3</li>
            </ul>
          </div>
        </div>
      ) : (
        <button id="chat-button" onClick={toggleChat}>
          <BsChatDots id='chat-icon'/>
          <div className='chat-unread-messages-count'>
            {unreadMessagesCount}
          </div>
        </button>
      )}
    </div>
  );
};

export default Chat;
