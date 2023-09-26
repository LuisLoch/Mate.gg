import React from 'react'
import './Notification.css'

import {uploads} from '../utils/config'

const Notification = ({ notifications, onClose }) => {
  return (
    <div className='overlay'>
      <div className='notification-dialog'>
        {Object.values(notifications).length > 0
          ? 
            <ul>
              {Object.values(notifications).map((notification) => (
                <li key={notification.description} className='notification-item'>
                  <div className='title'>{notification.title || ''}</div>
                  <div className='description'>{notification.description || ''}</div>
                </li>
              ))}
            </ul>
          :
            <div className="no-notifications">
              <img src={`${uploads}/smily_face.png`} alt={'smily_face'} className="no-notifications-image" />
              <p>Você não tem notificações, por enquanto...</p>
            </div>
        }
      </div>
      <button className='close-button' onClick={onClose}>
        Fechar
      </button>
    </div>
  )
}

export default Notification