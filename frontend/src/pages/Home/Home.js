import React from 'react'
import './Home.css'

import {uploads} from '../../utils/config'

//Hooks
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';

//Redux
import { getGames } from '../../slices/gameSlice';
import { getUserGames, profile } from '../../slices/userSlice'

//router
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {games} = useSelector((state) => state.game);
  const {user, userGames} = useSelector((state) => state.user);

  const [gameList, setGameList] = useState(null);

  useEffect(() => {
    dispatch(profile());
    dispatch(getGames());
  }, [dispatch]);

  useEffect(() => {
    if(games) {
      setGameList(games);
    }
  }, [games]);

  useEffect(() => {
    dispatch(getUserGames(user.id));
  }, [user, dispatch]);

  const handleGameItemClick = (gameKey) => {
    if(Object.keys(user).length === 0) {
      return navigate('/register');
    }

    if(!userGames || !Object.keys(userGames).includes(gameKey)) {
      return navigate(`/gameRegister/${gameKey}`);
    }

    return navigate(`/gamePage/${gameKey}`);
  };

  return (
    <div id='home'>
      <div className='homepage-infowindow'>
        <img className="homepage-image" src={`${uploads}/homepage_image/homepage_image.png`} alt={"homepage_image"} width="5280" height="3468"/>
        <h2 className='homepage-title'>Encontre a parceria de gameplay ideal</h2>
      </div>
      <div className='game-list-label'>
        <p>
          Jogos disponíveis
        </p>
      </div>
      <div className='game-list'>
        {gameList !== null ? (
          Object.entries(gameList).map(([key, game]) => (
            key !== 'labels' &&
            <div className="game-item" key={game.name} onClick={() => handleGameItemClick(key)}>
                <img src={`${uploads}/games/${game.splashart}`} alt={game.name} className="game-item-image" />
                <h3 className="game-item-title">{game.name}</h3>
            </div>
          ))
        ) : (
          <p>Carregando jogos...</p>
        )}
      </div>
    </div>
  )
}

export default Home