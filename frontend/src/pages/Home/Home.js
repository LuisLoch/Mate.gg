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
  const [userGameList, setUserGameList] = useState(null);

  useEffect(() => {
    dispatch(profile());
    dispatch(getGames());
  }, [dispatch]);

  useEffect(() => {
    if(games) {
      setGameList(games);
    }
    console.log(gameList);
  }, [games]);

  useEffect(() => {
    dispatch(getUserGames(user.id));
  }, [user]);

  useEffect(() => {
    if(userGames) {
      setUserGameList(userGames);
    }
    console.log("userGameList: ", userGameList);
  }, [userGames]);

  const handleGameItemClick = (game) => {
    if(Object.keys(user).length === 0) {
      return navigate('/register');
    }

    if(!user[game.key]) {
      return navigate(`/gameRegister?gameKey=${encodeURIComponent(JSON.stringify(game))}`);
    }

    
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
          Object.values(gameList).map((game) => (
            <div className="game-item" key={game.name} onClick={() => handleGameItemClick(game)}>
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