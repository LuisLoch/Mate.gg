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

  const {user, newUserChat} = useSelector((state) => state.user);

  const chatMessagesRef = useRef(null);

  const [socket, setSocket] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(false);
  const [chatMessages, setChatMessages] = useState({});
  const [messageId, setMessageId] = useState('');
  const [newMessage, setNewMessage] = useState(null);
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    dispatch(profile());
  }, [dispatch])

  //Creates and sets the socket variable, and sets the disconnection from socket when the component is dismounted
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

  //Sets the userId variable when the Redux store returns the user object
  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  //useEffect for when the userId or the socket variable change
  useEffect(() => {
    if (userId && socket) { //Emits a get-messages, when the socket or the userId changes, and only if they exist
      socket.emit('join', userId);
      socket.emit('get-messages');
 
      //If the server emits a message
      socket.on('messages', (messages) => {
        setChatMessages(messages); //Sets the chatMessages with the messages received from the server
        setUnreadMessages(messages.notification)
      });
      // socket.on('messages', (messages) => {
      //   setChatMessages((prevChatMessages) => {
      //     return { ...prevChatMessages, ...messages };
      //   });
      //   setUnreadMessages(messages.notification);
      // });

      //If the server emits a refresh message
      socket.on('refresh', () => {
        socket.emit('get-messages'); //Refreshes the user messages
      });

      //If the server requires login for some reason
      socket.on('login-necessary', () => {
        socket.emit('join', userId); //Log the current user in the server
      })
    } 

    return () => { //Sets the manipulator off when the component gets dismounted
      if (socket) {
        socket.off('messages');
        socket.off('refresh');
        socket.off('login-necessary');
      }
    };
  }, [userId, socket]);

  //Toggle open/close chat
  const toggleChat = () => {
    if(user.email && socket) {
      setIsOpen(!isOpen);
      socket.emit('notify', {user: user.id, value: false});
      setUnreadMessages(false);
      
      if(messageId == '' && chatMessages) { //If the chat has no messageId to list the messages from a single user and the chatMessages isn't empty
        setMessageId(Object.keys(chatMessages)[0]); //Sets the messageId from the first element of the messages
      }
    }
  };

  //Scrolls the chat till the end when it opens
  useEffect(() => {
    if (isOpen && chatMessages) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [isOpen, chatMessages]);

  //useEffect for when the newUserChat variable from Redux store changes
  useEffect(() => {
    if (newUserChat && socket) { //If a newUserChat and a socket exist
      var canStartChat = true;
      Object.keys(chatMessages).forEach((key) => { //Only starts the chat if there is no other messageId equal to the newUserChat.id
        if(key == newUserChat.id) {
          canStartChat = false;
        }
      })

      if(canStartChat == true) {
        //console.log("INICIOU UM NOVO CHAT: ", newUserChat)
        socket.emit('start-chat', {
          targetUser: newUserChat.id,
          userPhoto: user.photo || 'user.png',
          targetPhoto: newUserChat.photo || 'user.png'
        });
      }
    }
    dispatch(clearNewUserChat());
  }, [newUserChat])

  //Handles a message change for the message input
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  //Handles a player in the chat click
  const handleChatPlayerClick = (playerId) => {
    setMessageId(playerId)
  };

  //Handles a message submit from the message input
  const handleMessageSubmit = (e) => {
    if(socket && userId) {
      if(messageId && chatMessages[messageId]){
        socket.emit('send-message', { message: newMessage, targetUser: messageId, userPhoto: user.photo || 'user.png'});
  
        setNewMessage(null)
      }
    }
  };

  const getDateFromMilliseconds = (stringMilliseconds) => {
    const milliseconds = parseInt(stringMilliseconds, 10);

    const date = new Date(milliseconds);

    const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const month = date.getMonth() < 9 ? `0${date.getMonth()+1}` : date.getMonth();
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
              {chatMessages && Object.entries(chatMessages).map(([key, value]) => (
                key !== 'notification' && (
                  <li className="chat-players-item" key={key}>
                    <img
                      src={`${uploads}/users/${chatMessages[key].photo || 'user.png'}`}
                      alt={`user-${key}-photo`}
                      className="chat-players-item-image"
                      onClick={() => handleChatPlayerClick(key)}
                    />
                  </li>
                )
              ))}
            </ul>
            <div id="current-chat">
              <div id='current-chat-label'>
                {
                  chatMessages && chatMessages[messageId] 
                    ? chatMessages[messageId].photo
                      ? <img src={`${uploads}/users/${chatMessages[messageId].photo}`} id="current-chat-label-image"/>
                      : <img src={`${uploads}/users/user.png`} id="current-chat-label-image"/>
                    : null
                }
              </div>
              <ul id="chat-messages" ref={chatMessagesRef}>
                {chatMessages && chatMessages[messageId] && Object.keys(chatMessages[messageId]).map((key, index, messageIds) => {
                  if (key !== 'photo') {
                    const currentMessage = chatMessages[messageId][key];
                    const isCurrentUserMessage = currentMessage.sender === userId;
                    
                    return(
                      <li
                        key={key}
                        className={`chat-item ${isCurrentUserMessage ? 'current-user-message' : 'other-user-message'}`}
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
          {unreadMessages &&
            <div className='chat-unread-messages'>
              <img src={`${uploads}/exclamation_mark.png`} alt="chat-exclamation-mark" id='chat-exclamation-mark'/>
            </div>
          }
        </button>
      )}
    </div>
  );
};

export default Chat;