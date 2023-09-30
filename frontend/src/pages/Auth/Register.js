import React from 'react'
import './Auth.css'

//components
import Message from '../../components/Message';

//router
import {Link} from 'react-router-dom';

//hooks
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//redux
import { register, reset } from '../../slices/authSlice';

const Register = () => {
  const [email, setEmail] = useState("");
  // const [birth_date, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();

  const {loading, error} = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = {
      email,
      // birth_date,
      password,
      confirmPassword
    }

    console.log(user);

    dispatch(register(user));
  }

  //clean auth states
  useEffect(() => {
    dispatch(reset());
  }, [dispatch])

  return <div id='register'>
    <h2>Mate.gg</h2>
    <p className='subtitle'>Crie uma conta</p>
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder='Email' value={email || ""} onChange={(e) => setEmail(e.target.value)}/>
      {/* <input type="date" placeholder='Data de nascimento' value={birth_date || ""} onChange={(e) => setBirthDate(e.target.value)}/> */}
      <input type="password" placeholder='Senha' value={password || ""} onChange={(e) => setPassword(e.target.value)}/>
      <input type="password" placeholder='Confirmação de senha' value={confirmPassword || ""} onChange={(e) => setConfirmPassword(e.target.value)}/>
      {!loading && <input type="submit" value="Cadastrar" />}
      {loading && <input type="submit" disabled value="Aguarde..." />}
      {error && <Message msg={error} type="error" />}
    </form>
    <p>Já possui conta? <Link to="/login">Clique aqui.</Link></p>
  </div>
}

export default Register