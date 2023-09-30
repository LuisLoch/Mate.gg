import React from 'react';
import './GameRegister.css';

import {uploads} from '../../utils/config'

//Hooks
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Redux
import { getUserGames, profile, resetMessage, updateProfile } from '../../slices/userSlice'

//Components
import Message from '../../components/Message'

//Router
import { useParams } from 'react-router-dom';

const GameRegister = () => {
  const { game } = useParams();

  const dispatch = useDispatch();

  const {userGames} = useSelector((state) => state.user);

  const [userInfo, setUserInfo] = useState(null);
  const [gameFields, setGameFields] = useState(null);

  //Load user data for the game
  useEffect(() => {
    getUserGames(profile());
  }, [dispatch]);

  //Fill user info with the game
  useEffect(() => {
    if(userGames && game) {
      const gameInfo = userGames[game];
      if(gameInfo) {
        setUserInfo(gameInfo);
      }
    }
  }, [userGames, game])

  useEffect(() => {

  }, [])

  const handleSubmit = async (e) => {
    
    // build form data
    const formData = new FormData();

    const userFormData = Object.keys(userData).forEach((key) =>
      formData.append(key, userData[key])
    );

    formData.append("user", userFormData);

    await dispatch(updateProfile(formData));

    setTimeout(() => {
      dispatch(resetMessage());
    }, 2000)
  }

  return (
    <div id='edit-profile'>
      <h2>Perfil de jogo: {game}</h2>
      <p className='subtitle'>Informe os dados de sua conta de jogo</p>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name}>{field.name}:</label>
            {field.type === 'Integer' ? (
              <input
                type="number"
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
              />
            ) : (
              <input
                type="text"
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <button type="submit">Salvar</button>
        {!loading && <input type="submit" value="Salvar" />}
        {loading && <input type="submit" disabled value="Aguarde..." />}
        {error && <Message msg={error} type="error" />}
        {message && <Message msg={message} type="success" />}
      </form>
    </div>
  )
}

export default GameRegister;