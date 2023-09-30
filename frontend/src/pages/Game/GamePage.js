import React from 'react';
import './GamePage.css';

const GamePage = (gameImage, gameUserInfo) => {
  return (
    <div className="game-page">
      <img
        className="background-image"
        src={gameImage}
        alt="background"
      />
      <div className="game-list">
        {/* Seu componente de lista aqui */}
      </div>
    </div>
  );
};

export default GamePage;
