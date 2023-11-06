import React from 'react';
import './GamePage.css';

import {uploads} from '../../utils/config'

import { BsJoystick } from 'react-icons/bs'

//Hooks
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';

//Redux
import { getGames } from '../../slices/gameSlice';
import { getPlayers, getUserGames, newUserChat, profile } from '../../slices/userSlice'

//router
import { useNavigate, useParams } from 'react-router-dom';

const GamePage = () => {
  //Predefined functions
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //Params
  const { game } = useParams();

  //Store
  const { games } = useSelector((state) => state.game);
  const { players, user } = useSelector((state) => state.user);
  const { userGames } = useSelector((state) => state.user);
  
  //useState
  const [gameInfo, setGameInfo] = useState(null);
  const [gamePlayers, setGamePlayers] = useState(null);
  const [gameLabels, setGameLabels] = useState(null);
  const [userHasGame, setUserHasGame] = useState(false);

  //Load game and users data for the list of players
  useEffect(() => {
    dispatch(profile())
    dispatch(getGames());
    dispatch(getPlayers(game));
    dispatch(getUserGames())
  }, [dispatch, game]);

  useEffect(() => {
    if(userGames && userGames[game]) {
      setUserHasGame(true);
    } else {
      setUserHasGame(false);
    }
  }, [userGames]);

  useEffect(() => {
    if(games && games[game]) {
      if (games[game]) {
        const userInfo = games[game].userInfo;
        const formattedUserInfo = {};
      
        for (const key in userInfo) {
          if (userInfo.hasOwnProperty(key)) {
            const formattedKey = key.replace(/^\d+/g, '');
            formattedUserInfo[formattedKey] = userInfo[key];
          }
        }
      
        const formattedGameInfo = { ...games[game] };
        formattedGameInfo.userInfo = formattedUserInfo;
      
        setGameInfo(formattedGameInfo);
      }
      if(games.labels) {
        const labelsArray = Object.keys(games.labels);

        const sortedLabelsArray = labelsArray.sort((a, b) => {
          const matchA = a.match(/\d+/);
          const matchB = b.match(/\d+/);
      
          if (matchA && matchB) {
              const numA = parseInt(matchA[0]);
              const numB = parseInt(matchB[0]);
              return numA - numB;
          }
        });

        const sortedLabels = {};

        sortedLabelsArray.forEach((key) => {
          sortedLabels[key] = games.labels[key];
        });

        setGameLabels(sortedLabels)
      }
    }
  }, [games]);

  useEffect(() => {
    if(players) {
      setGamePlayers(players);
    }
  }, [players]);

  const handleGameRegisterButtonClick = async (e) => {
    e.preventDefault();

    return navigate(`/gameRegister/${game}`);
  }

  //Starts a chat with the clicked player
  const handlePlayerClick = (player) => {  
    console.log(user);
    if(user && user.id !== player.id) {
      console.log("Clicou no player", player.id, player.photo);
      dispatch(newUserChat(player))
      console.log("Setou o newUserChat")
    }
  }

  const getAgeByBirthDate = (value) => {
    const birthDate = new Date(value);
    const now = new Date();

    const differenceInMilliseconds = now - birthDate;

    return Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24 * 365.25));
  }

  return (
    <div className="game-page">
      {userHasGame === true ? (
        <>
          <div className="game-register-button" onClick={handleGameRegisterButtonClick}>
            <button><BsJoystick/> Perfil de jogador</button>
          </div>
          {gameInfo ? (
            <div>
              <img
                className="background-image"
                src={`${uploads}/games/${gameInfo.background}`}
                alt="background"
              />
              <div className='player-list'>
                <div className='player-list-title'>
                  <h2>{gameInfo.name}</h2>
                </div>
                <ul className='horizontal-list'>
                  <li id='player-info-labels'>
                    {gameInfo.userInfo && gameLabels ? (
                      Object.entries(gameInfo.userInfo).map(([key]) => (
                        <span key={key} className={`player-info-labels-item ${key === 'description' ? 'double-space' : ''}`}>{gameLabels[key]}</span>
                      )
                    )) : (
                      <p>Nenhuma label disponível.</p>
                    )}
                    <span className='player-info-labels-item half-space' key='region'>{gameLabels.region}</span>
                    <span className='player-info-labels-item half-space' key='birth_date'>{gameLabels.birth_date}</span>
                  </li>
                  {gamePlayers ? (
                    Object.entries(gamePlayers).map(([playerKey, playerData]) => {

                      const orderedKeys = Object.keys(gameInfo.userInfo);
                      return (
                        <li className='player-info' key={playerKey} onClick={() => handlePlayerClick(playerData)}>
                          {orderedKeys.map((key) => {
                            const value = playerData[key] || "N/A";
                            return (
                              <span className={`player-info-item ${key === 'description' ? 'double-space' : ''}`} key={key}>
                                {key === 'nickname' ? (
                                  <>
                                    {playerData.photo && <img src={`${uploads}/users/${playerData.photo}`} className="nickname-image" />}                                
                                    {<div className='player-info-text-container'>{value}</div>}
                                  </>
                                ) : (
                                  value
                                )}
                              </span>
                            );
                          })}
                          <span className='player-info-item half-space' key='region'>
                            {playerData.region || 'N/A'}
                          </span>
                          <span className='player-info-item half-space' key='birth_date'>
                            {getAgeByBirthDate(playerData.birth_date) || 'N/A'}
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li>N/A</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <p>Carregando jogos...</p>
          )}
        </>
      ) : (
        <>
          <h2 id='you-dont-have-the-game-message'>
            Você não possui o jogo, danadinho!
          </h2>
        </>
      )}
    </div>
  );
};

export default GamePage;