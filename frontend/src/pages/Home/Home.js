import React from 'react'
import './Home.css'

import {uploads} from '../../utils/config'

//Hooks
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';

//Redux
import { listGames } from '../../slices/gameSlice';

//router
import {Link} from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();

  const {games, message, error, loading} = useSelector((state) => state.game);

  const [gameList, setGameList] = useState(null);

  useEffect(() => {
    dispatch(listGames());
  }, [dispatch]);

  useEffect(() => {
    if(games) {
      setGameList(games);
    }    
  }, [games]);

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
            <div className="game-item" key={game.name}>
              <Link to={`/games/${encodeURIComponent(game.name)}`} className="game-item-link">
                <img src={`${uploads}/games/${game.splashart}`} alt={game.name} className="game-item-image" />
                <h3 className="game-item-title">{game.name}</h3>
              </Link>
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