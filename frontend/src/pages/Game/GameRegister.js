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
      }
    }
  }, [games, game]);

  //Fill userGames with the game from his list of games
  useEffect(() => {
    if (userGames && game) {
      if (userGames[game]) {
        if (userGames[game].dailyOnlineTime) {
          var newFormData = {
            ...userGames[game]
          };

          console.log("newFormData: ", newFormData)
  
          try {
            const timeParts = userGames[game].dailyOnlineTime.split(" - ");
  
            if (timeParts.length === 2) {
              const [startHour, startMinute] = timeParts[0].split(":").map(Number);
              const [endHour, endMinute] = timeParts[1].split(":").map(Number);
  
              newFormData = {
                ...newFormData,
                startHour,
                startMinute,
                endHour,
                endMinute
              }
            }
          } catch (error) {}
          setFormDataObject(newFormData);
          console.log("newFormData: ", newFormData)
        }
      }
    }
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
          console.log("formattedUserInfo: ", formattedUserInfo)
        }
      }
    }
  }, [games]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    try {
      var newValue;
      if(name === 'level') {
        newValue = parseInt(value);
      } else {
        newValue = value;
      }
  
      setFormDataObject({ ...formDataObject, [name]: newValue });

    } catch {}

  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    try{
      const newValue = parseInt(value);
      if (!isNaN(newValue) && (parseInt(value) >= 0)) {
        setFormDataObject({ ...formDataObject, [name]: newValue });
      }
    } catch {}  
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;

    
    if (!isNaN(value) && parseInt(value) >= 0) {
      setFormDataObject({ ...formDataObject, [name]: parseInt(value) });
    }
  };

  const handleLolMainsChange = (e, index) => {
    const { name, value } = e.target;
    
    var currentMains = formDataObject['mains'];

    if (!currentMains) {
      setFormDataObject({ ...formDataObject, [name]: value});
      return;
    }

    const mainsArray = currentMains.split(', ');
    if(!mainsArray.includes(value)) {
      if(mainsArray.length === 1) {
        if(index === 0) {
          setFormDataObject({ ...formDataObject, [name]: value})
        } else {
          const newMains = `${mainsArray[0]}, ${value}`;
          setFormDataObject({ ...formDataObject, [name]: newMains})
        }
      } else if (mainsArray.length === 2) {
        if(index === 0) {
          const newMains = `${value}, ${mainsArray[1]}`
          setFormDataObject({ ...formDataObject, [name]: newMains})
        } else if(index === 1) {
          const newMains = `${mainsArray[0]}, ${value}`
          setFormDataObject({ ...formDataObject, [name]: newMains})
        } else if(index === 2) {
          const newMains = `${mainsArray[0]}, ${mainsArray[1]}, ${value}`
          setFormDataObject({ ...formDataObject, [name]: newMains})
        }
      } else if (mainsArray.length === 3) {
        if(index === 0) {
          const newMains = `${value}, ${mainsArray[1]}, ${mainsArray[2]}`
          setFormDataObject({ ...formDataObject, [name]: newMains})
        } else if(index === 1) {
          const newMains = `${mainsArray[0]}, ${value}, ${mainsArray[2]}`
          setFormDataObject({ ...formDataObject, [name]: newMains})
        } else if(index === 2) {
          const newMains = `${mainsArray[0]}, ${mainsArray[1]}, ${value}`
          setFormDataObject({ ...formDataObject, [name]: newMains})
        }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    var data = {...formDataObject};
    const userId = user.id;
    data.userId = userId;
    data.game = game;
    data.validations = Object.keys(gameFields).map((key) => key.toString());
    if(formDataObject["startHour"] >= 0 && formDataObject["startMinute"] >= 0 && formDataObject["endHour"] >= 0 && formDataObject["endMinute"] >= 0) {
      const newStartHour = formDataObject["startHour"] < 10 ? `0${formDataObject["startHour"]}` : `${formDataObject["startHour"]}`;
      const newStartMinute = formDataObject["startMinute"] < 10 ? `0${formDataObject["startMinute"]}` : `${formDataObject["startMinute"]}`;
      const newEndHour = formDataObject["endHour"] < 10 ? `0${formDataObject["endHour"]}` : `${formDataObject["endHour"]}`;
      const newEndMinute = formDataObject["endMinute"] < 10 ? `0${formDataObject["endMinute"]}` : `${formDataObject["endMinute"]}`;
      const dailyOnlineTime = `${newStartHour}:${newStartMinute} - ${newEndHour}:${newEndMinute}`;
      data = {
        ...data,
        dailyOnlineTime
      }
    }

    delete data.startHour;
    delete data.startMinute;
    delete data.endHour;
    delete data.endMinute;
    console.log("Dados enviados: ", data);

    const updateReturn = await dispatch(updateUserGame(data));

    setTimeout(() => {
      dispatch(resetMessage());
      console.log("Update return: ", updateReturn)
      if(!updateReturn.error) {
        return navigate(`/gamePage/${game}`);
      }
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
                          value={formDataObject['startHour'] !== null ? formDataObject['startHour'] : ''}
                          onChange={handleTimeChange}
                        >
                          <option value={null}>Selecione</option>
                          {Array.from({ length: 24 }, (_, i) => i).map((startHour) => (
                            <option key={startHour} value={startHour}>
                              {startHour < 10 ? `0${startHour}h` : `${startHour}h`}
                            </option>
                          ))}
                        </select>
                        <span className='separator'>:</span>
                        <select
                          id={`startMinute`}
                          name={`startMinute`}
                          value={formDataObject['startMinute'] !== null ? formDataObject['startMinute'] : ''}
                          onChange={handleTimeChange}
                        >
                          <option value={null}>Selecione</option>
                          {Array.from({ length: 60 }, (_, i) => i).map((startMinute) => (
                            <option key={startMinute} value={startMinute}>
                              {startMinute < 10 ? `0${startMinute}m` : `${startMinute}m`}
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
                          value={formDataObject['endHour'] !== null ? formDataObject['endHour'] : ''}
                          onChange={handleTimeChange}
                        >
                          <option value={null}>Selecione</option>
                          {Array.from({ length: 24 }, (_, i) => i).map((endHour) => (
                            <option key={endHour} value={endHour}>
                              {endHour < 10 ? `0${endHour}h` : `${endHour}h`}
                            </option>
                          ))}
                        </select>
                        <span className='separator'>:</span>
                        <select
                          id={`endMinute`}
                          name={`endMinute`}
                          value={formDataObject['endMinute'] !== null ? formDataObject['endMinute'] : ''}
                          onChange={handleTimeChange}
                        >
                          <option value={null}>Selecione</option>
                          {Array.from({ length: 60 }, (_, i) => i).map((endMinute) => (
                            <option key={endMinute} value={endMinute}>
                              {endMinute < 10 ? `0${endMinute}m` : `${endMinute}m`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : typeof field == typeof [] && fieldName === 'mains' ? (
                  <div id='lol-mains'>
                    {Array(3).fill().map((_, index) => (
                      <select
                        key={`${fieldName}-${index}`}
                        id={fieldName}
                        className='lol-main-selector'
                        name={fieldName}
                        value={(formDataObject[fieldName] && formDataObject[fieldName].split(', ')[index]) || ''}
                        onChange={(e) => handleLolMainsChange(e, index)}
                      >
                        <option value="">
                          Selecione
                        </option>
                        {Object.values(field).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                ) : field === 'Integer' ? (
                  <input
                    type="number"
                    id={fieldName}
                    name={fieldName}
                    value={formDataObject[fieldName] === 0 ? 0 : formDataObject[fieldName] ? formDataObject[fieldName] : ''}
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
                    value={formDataObject[fieldName] === 0 ? 0 : formDataObject[fieldName] ? formDataObject[fieldName] : ''}
                    onChange={handleChange}
                  >
                    <option value="">
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