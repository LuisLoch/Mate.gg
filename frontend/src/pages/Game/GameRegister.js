import React from 'react';
import './GameRegister.css';

//Hooks
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { BsListCheck } from 'react-icons/bs'

//Redux
import { getUserGames, profile, resetMessage, updateUserGame } from '../../slices/userSlice'
import { getGames } from '../../slices/gameSlice';

//Components
import Message from '../../components/Message'

//Router
import { useParams, useNavigate } from 'react-router-dom';

const GameRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //Get the game id from the url (eft, lol, dayz)
  const { game } = useParams();

  //Get the current user games and his games infos
  const { user, userGames, loading, error, message } = useSelector((state) => state.user);
  //Get the list of games of the website
  const { games } = useSelector((state) => state.game);

  //The current user's current game info
  const [userGameInfo, setUserGameInfo] = useState(null);
  //The current game fields to register or update
  const [gameFields, setGameFields] = useState(null);
  //The current game name (Escape From Tarkov, League of Legends, DayZ)
  const [gameName, setGameName] = useState("");
  //The labels to the fields of the game
  const [labels, setLabels] = useState(null);

  //The objectified formData, that will be turned into a real FormData to be sent to register/update
  const [formDataObject, setFormDataObject] = useState({});

  //Load user data for the game
  useEffect(() => {
    dispatch(profile())
    dispatch(getUserGames())
    dispatch(getGames())
  }, [dispatch]);

  useEffect(() => {
    if(games && game) {
      if(games[game] && games[game].name){
        setGameName(games[game].name);
        setLabels(games["labels"])
        console.log("LABELS: ", labels)
      }
    }
  }, [games, game]);

  //Fill userGames with the game from his list of games
  useEffect(() => {
    if(userGames && game) {
      if(userGames[game]) {
        setFormDataObject(userGames[game]);
      }
    }
    console.log("formDataObject: ", formDataObject)
  }, [userGames, game]);

  //Fill user game info to edit (if exists), and fill the gameInfo needed to create the form and register
  useEffect(() => {
    if(userGames[game]) {
      setUserGameInfo(userGames[game]);
    }
    if(games) {
      if(games[game] && games[game].userInfo) {
        if (games[game]) {
          const userInfo = games[game].userInfo;
          const formattedUserInfo = {};
        
          for (const key in userInfo) {
            if (userInfo.hasOwnProperty(key)) {
              const formattedKey = key.replace(/^\d+/g, '');
              formattedUserInfo[formattedKey] = userInfo[key];
            }
          }
        
          setGameFields(formattedUserInfo);
        }
      }
    }
  }, [games]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataObject({ ...formDataObject, [name]: value });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
  
    if (!isNaN(value) && parseFloat(value) >= 0) {
      setFormDataObject({ ...formDataObject, [name]: value });
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
  
    if (!isNaN(value) && parseFloat(value) >= 0) {
      setFormDataObject({ ...formDataObject, [name]: value });
    }
    console.log(formDataObject);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = formDataObject;
    data.userId = user.id;
    data.game = game;
    data.validations = Object.keys(games[game].userInfo);
    console.log("validations: ", data.validations);
    if(formDataObject["startHour"] && formDataObject["startMinute"] && formDataObject["endHour"] && formDataObject["endMinute"]) {
      formDataObject["startHour"] = formDataObject["startHour"] < 10 ? `0${formDataObject["startHour"]}` : `${formDataObject["startHour"]}`;
      formDataObject["startMinute"] = formDataObject["startMinute"] < 10 ? `0${formDataObject["startMinute"]}` : `${formDataObject["startMinute"]}`;
      formDataObject["endHour"] = formDataObject["endHour"] < 10 ? `0${formDataObject["endHour"]}` : `${formDataObject["endHour"]}`;
      formDataObject["endMinute"] = formDataObject["endMinute"] < 10 ? `0${formDataObject["endMinute"]}` : `${formDataObject["endMinute"]}`;
      data.dailyOnlineTime = `${formDataObject["startHour"]}:${formDataObject["startMinute"]} - ${formDataObject["endHour"]}:${formDataObject["endMinute"]}`;
    }

    delete formDataObject["startHour"];
    delete formDataObject["startMinute"];
    delete formDataObject["endHour"];
    delete formDataObject["endMinute"];
    console.log("DATA: ", data);
    await dispatch(updateUserGame(data));
    delete data.dailyOnlineTime;
  
    setTimeout(() => {
      dispatch(resetMessage());
      return navigate(`/gamePage/${game}`);
    }, 2000);
  };

  const hangleGamePageButtonClick = async (e) => {
    e.preventDefault();

    return navigate(`/gamePage/${game}`);
  }

  return (
    <div id='game-register'>
      {userGameInfo &&
      <div className="game-page-button" onClick={hangleGamePageButtonClick}>
        <button><BsListCheck/> Lista de jogadores</button>
      </div>}
      <div id='game-register-form'>
        <h2>Perfil de jogo: {gameName}</h2>
        <p className='subtitle'>Informe ou altere os dados de sua conta de jogo.</p>
        <form onSubmit={handleSubmit}>
          {gameFields && Object.entries(gameFields).map(([fieldName, field], key) => (
            <div key={key}>
              <label>
                <span>{labels[fieldName] || fieldName}:</span>
                {fieldName === 'dailyOnlineTime' ? (
                  <div id='dailyOnlineTime'>
                    <div className='time-selection'>
                      <span>Começa às:</span>
                      <div className='time-selector'>
                        <select
                          id={`startHour`}
                          name={`startHour`}
                          value={formDataObject[`startHour`] || ''}
                          onChange={handleTimeChange}
                        >
                          <option value={null}>Selecione</option>
                          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                            <option key={hour} value={hour}>
                              {hour < 10 ? `0${hour}h` : `${hour}h`}
                            </option>
                          ))}
                        </select>
                        <span className='separator'>:</span>
                        <select
                          id={`startMinute`}
                          name={`startMinute`}
                          value={formDataObject[`startMinute`] || ''}
                          onChange={handleTimeChange}
                        >
                          <option value={null}>Selecione</option>
                          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                            <option key={minute} value={minute}>
                              {minute < 10 ? `0${minute}m` : `${minute}m`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className='time-selection'>
                      <span>Termina às:</span>
                      <div className='time-selector'>
                        <select
                          id={`endHour`}
                          name={`endHour`}
                          value={formDataObject[`endHour`] || ''}
                          onChange={handleTimeChange}
                        >
                          <option value={null}>Selecione</option>
                          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                            <option key={hour} value={hour}>
                              {hour < 10 ? `0${hour}h` : `${hour}h`}
                            </option>
                          ))}
                        </select>
                        <span className='separator'>:</span>
                        <select
                          id={`endMinute`}
                          name={`endMinute`}
                          value={formDataObject[`endMinute`] || ''}
                          onChange={handleTimeChange}
                        >
                          <option value={null}>Selecione</option>
                          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                            <option key={minute} value={minute}>
                              {minute < 10 ? `0${minute}m` : `${minute}m`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : field === 'Integer' ? (
                  <input
                    type="number"
                    id={fieldName}
                    name={fieldName}
                    value={formDataObject[fieldName] || ''}
                    onChange={handleNumberChange}
                  />
                ) : field === 'String' ? (
                  <input
                    type="text"
                    id={fieldName}
                    name={fieldName}
                    value={formDataObject[fieldName] || ''}
                    onChange={handleChange}
                  />
                ) : typeof field == typeof [] ? (
                  <select
                    id={fieldName}
                    name={fieldName}
                    value={formDataObject[fieldName] || ''}
                    onChange={handleChange}
                  >
                    <option value={null}>
                      Selecione
                    </option>
                    {Object.values(field).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p>Unsupported field type</p>
                )}
              </label>
            </div>
          ))}
          {!loading && !userGames[game] && <input type="submit" value="Registrar" />}
          {!loading && userGames[game] && <input type="submit" value="Salvar" />}
          {loading && <input type="submit" disabled value="Aguarde..." />}
          {error && <Message msg={error} type="error" />}
          {message && <Message msg={message} type="success" />}
        </form>
      </div>
    </div>
  )
}

export default GameRegister;