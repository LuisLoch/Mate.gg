import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';

//Chat server
import io from 'socket.io-client';

//Uploads
import {uploads} from '../utils/config'

//Icons
import { BsX, BsChatDots } from 'react-icons/bs'

//Redux
import { useDispatch, useSelector } from 'react-redux';
import { clearNewUserChat, profile } from '../slices/userSlice';

const Chat = () => {
  const dispatch = useDispatch();

  const {user, newUserChat, newUserChatPhoto} = useSelector((state) => state.user);

  const chatMessagesRef = useRef(null);

  const [socket, setSocket] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(1);
  const [chatMessages, setChatMessages] = useState({});
  const [messageId, setMessageId] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    dispatch(profile());
  }, [dispatch])

  //Create and set the socket variable, and sets the disconnection from socket when the component is dismounted
  useEffect(() => {
    const newSocket = io('http://localhost:4000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    return () => { //Disconnect from server when Chat.js is dismounted
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  //Set the userId variable when the store returns the user object
  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  //Joins the client in the server when the socket and the userId are ready
  useEffect(() => {
    if (userId && socket) {
      socket.emit('join', userId);
    }
  }, [userId, socket]);

  //Emits the command to search for messages and sets the manipulator to when messages are received
  useEffect(() => {
    if (userId && socket) {
      socket.emit('get-messages');
      socket.on('messages', (messages) => {
        setChatMessages(messages);
      });
    } 

    return () => { //Sets the manipulator off when the component gets dismounted
      if (socket) {
        socket.off('messages');

      }
    };
  }, [userId, socket]);

  //Toggle open/close chat
  const toggleChat = () => {
    if(user.email) {
      setIsOpen(!isOpen);
    }
  };

  //Scrolls the chat till the end when it opens
  useEffect(() => {
    if (isOpen) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [isOpen]);

  //Starts a new chat with an user
  useEffect(() => {
    console.log("NEW USER CHAT MUDOU: ", newUserChat)
    if(newUserChat && socket) {
      console.log("INICIOU UM NOVO CHAT!")
      console.log("NEW USER CHAT: ", newUserChat)
      socket.emit('start-chat', { message: 'Olá, vamos jogar!', targetUser: newUserChat.id, userPhoto: user.photo, targetPhoto: newUserChat.photo});
      dispatch(clearNewUserChat());
    }
  }, [newUserChat])

  //Handles a message change for the message input
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  //Handles a player in the chat click
  const handleChatPlayerClick = (playerId) => {
    setMessageId(playerId)
    console.log("MessageId: ", messageId)
  };

  //Handles a message submit from the message input
  const handleMessageSubmit = (e) => {
    if(socket && userId) {
      const targetUser = messageId;

      socket.emit('send-message', { message: newMessage, targetUser: targetUser});

      setNewMessage(null)
    }
  };

  const getDateFromMilliseconds = (stringMilliseconds) => {
    const milliseconds = parseInt(stringMilliseconds, 10);

    const date = new Date(milliseconds);

    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDate = `${day}/${month}/${year} ${hour}:${minute}`;

    return formattedDate;
  }

  return (
    <div id='chat-component' className={`${isOpen ? 'open' : 'closed'}`}>
      {isOpen ? (
        <div id="chat-window">
          <button id="chat-close-button" onClick={toggleChat}>
            <BsX/>
          </button>
          <div id='chat-list'>
            <ul id='chat-players'>
              {chatMessages && messageId && Object.keys(chatMessages).map((key, index, messageIds) => (
                console.log(chatMessages[key].photo),
                <li className="chat-players-item" key={key}>
                  <img
                    src={chatMessages[key].photo ? `${uploads}/users/${chatMessages[key].photo}` : `${uploads}/users/user.png`}
                    alt={`user-${key}-photo`}
                    className="chat-players-item-image"
                    onClick={() => handleChatPlayerClick(key)}
                  />
                </li>
              ))}
            </ul>
            <div id="current-chat">
              <div id='current-chat-label'>
                {chatMessages && chatMessages[messageId] && chatMessages[messageId].photo ? <img src={`${uploads}/users/${chatMessages[messageId].photo}`}/> : <img src={`${uploads}/users/user.png`} alt={'user-1-photo'} id="current-chat-label-image" />}
              </div>
              <ul id="chat-messages" ref={chatMessagesRef}>
                {console.log("FOTO DO USUÁRIO: ", chatMessages[messageId])}
                {chatMessages && chatMessages[messageId] && Object.keys(chatMessages[messageId]).map((key, index, messageIds) => {
                  if (key != 'photo') {
                    const currentMessage = chatMessages[messageId][key];
                    const isCurrentUserMessage = currentMessage.sender === userId;
                    const nextMessageKey = messageIds[index + 1];
                    const nextMessage = nextMessageKey ? chatMessages[messageId][nextMessageKey] : null;
                    const shouldAddBorderClass = !isCurrentUserMessage && nextMessage && nextMessage.sender !== userId;
  
                    return(
                      <li
                        key={key}
                        className={`chat-item ${isCurrentUserMessage ? 'current-user-message' : 'other-user-message'}
                        ${shouldAddBorderClass ? 'chat-item-border-bottom' : ''}`}
                      >
                        <p className='chat-item-time-label'>{getDateFromMilliseconds(key)}</p>
                        {currentMessage.message}
                      </li>
                    );
                  }
                })}
              </ul>
              <input
                type="text"
                id='message-input'
                value={newMessage || ''}
                placeholder='Digite aqui...'
                onChange={handleMessageChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent the default form submission
                    handleMessageSubmit(); // Call your submit function here
                  }
                }}
              />
            </div>
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
