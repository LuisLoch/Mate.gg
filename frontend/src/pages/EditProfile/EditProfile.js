import React from 'react';
import './EditProfile.css';

import {uploads} from '../../utils/config'

//Hooks
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Redux
import { profile, resetMessage, updateProfile } from '../../slices/userSlice'

//Components
import Message from '../../components/Message'

const EditProfile = () => {
  const dispatch = useDispatch();

  const {user, message, error, loading} = useSelector((state) => state.user)

  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [birth_date, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  //Load user data
  useEffect(() => {
    dispatch(profile());
  }, [dispatch]);

  //Fill form with user data
  useEffect(() => {
    console.log("Usuário: ", user)
    if(user) {
      setEmail(user.email);
      setRegion(user.region);
      setBirthDate(user.birth_date)
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {}

    if(birth_date) {
      userData.birth_date = birth_date;
    }

    if(photo) {
      userData.photo = photo;
    }

    if(birth_date) {
      userData.birth_date = birth_date.toString();
    }

    if(region) {
      userData.region = region;
    }

    if(password) {
      userData.password = password;
    }

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

  const handleFile = (e) => {
    //Make image preview
    const image = e.target.files[0];

    setPreviewImage(image);

    //Update image state
    setPhoto(image);
  }

  return (
    <div id='edit-profile'>
      <h2>Edição de perfil</h2>
      <p className='subtitle'>Adicione uma imagem de perfil ou altere alguma informação.</p>
      {(user.photo || previewImage) && (
        <img
          className="profile-image"
          src={
            previewImage
              ? URL.createObjectURL(previewImage)
              : `${uploads}/users/${user.photo}`
          }
          alt={user.name}
        />
      )}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder='E-mail' disabled value={email || ""}/>
        <label>
          <span>Data de nascimento:</span>
          <input type="date" placeholder='Data de nascimento' onChange={(e) => setBirthDate(e.target.value)} value={birth_date || ""}/>
        </label>
        <label>
          <span>Região:</span>
          <select name="regiao" id="regiao" onChange={(e) => setRegion(e.target.value)} value={region || ""}>
            <option value="">N/A</option>
            <option value="Norte">Norte</option>
            <option value="Nordeste">Nordeste</option>
            <option value="Sudeste">Sudeste</option>
            <option value="Sul">Sul</option>
            <option value="Centro-Oeste">Centro-Oeste</option>
          </select>
        </label>
        <label>
          <span>Imagem de perfil:</span>
          <input type="file" onChange={handleFile}/>
        </label>
        <label>
          <span>Deseja alterar a senha?</span>
          <input type="password" placeholder='Digite a nova senha' onChange={(e) => setPassword(e.target.value)} value={password || ""}/>
        </label>
        {!loading && <input type="submit" value="Salvar" />}
        {loading && <input type="submit" disabled value="Aguarde..." />}
        {error && <Message msg={error} type="error" />}
        {message && <Message msg={message} type="success" />}
      </form>
    </div>
  )
}

export default EditProfile