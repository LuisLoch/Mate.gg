import React from 'react'
import "./Navbar.css";

//components
import { NavLink, Link } from 'react-router-dom'
import { BsHouseDoorFill, BsFillPersonFill, BsBellFill } from 'react-icons/bs'
import Notification from './Notification'

//hooks
import { useAuth } from '../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

//redux
import {logout, reset} from '../slices/authSlice'
import { listNotifications, resetNotifications } from '../slices/notificationSlice';

const Navbar = () => {
  const {auth} = useAuth();
  const {user} = useSelector((state) => state.auth);
  const {notifications} = useSelector((state) => state.notification);

  const [notificationList, setNotificationList] = useState(null);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(reset());
    dispatch(resetNotifications());
    
    window.location.reload();
  }

  useEffect(() => {
    if(user) {
      dispatch(listNotifications(user._id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if(notifications) {
      setNotificationList(notifications);
    }
  }, [notifications, user]);


  return <nav id='nav'>
    <div className='btn-logo'>
      <Link to='/'>Mate.gg</Link>
    </div>
    {isNotificationDialogOpen && (
      <Notification notifications={notificationList} onClose={() => setIsNotificationDialogOpen(false)}/>
    )}
    <ul id='nav-links'>
      {auth ? (
        <>
          <li>
            <NavLink to='/'>
              <BsHouseDoorFill/>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile">
              <BsFillPersonFill/>
            </NavLink>
          </li>
          {Object.values(notificationList).length > 0
            ? (
                <li id='notification-button'>
                  <BsBellFill onClick={() => setIsNotificationDialogOpen(true)}/>
                  <span>{Object.values(notificationList).length}</span>
                </li>
              )
            : (
                <li id='notification-button'>
                  <BsBellFill onClick={() => setIsNotificationDialogOpen(true)}/>
                </li>
              )
          }
          <li>
            <span onClick={handleLogout}>
              Sair
            </span>
          </li>
        </>
      ) : (
        <>
          <li>
            <NavLink to='/login'>
              Entrar
            </NavLink>
          </li>
          <li>
            <NavLink to='/register'>
              Cadastrar-se
            </NavLink>
          </li>
        </>
      )}
    </ul>
  </nav>
}

export default Navbar