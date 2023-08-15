import React from 'react'
import "./Navbar.css";

//components
import { NavLink, Link } from 'react-router-dom'
import { BsSearch, BsHouseDoorFill, BsFillPersonFill, BsFillCamerFill } from 'react-icons/bs'

//hooks
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

//redux
import {logout, reset} from '../slices/authSlice'

const Navbar = () => {
  const {auth} = useAuth();
  const {user} = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());

    navigate("/login");
  }

  return <nav id='nav'>
    <Link to='/'>Mate.gg</Link>
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