import React from 'react'
import './Home.css'

import {uploads} from '../../utils/config'

//Hooks
import { useState } from 'react';

const Home = () => {
  return (
    <div id='home'>
      <div className='homepage-infowindow'>
        <img className="homepage-image" src={`${uploads}/homepage_image/homepage_image.png`} alt={"homepage_image"}/>
        <h2 className='homepage-title'>Encontre a parceria de gameplay ideal</h2>
      </div>
      <div className='game-list'>

      </div>
    </div>
  )
}

export default Home