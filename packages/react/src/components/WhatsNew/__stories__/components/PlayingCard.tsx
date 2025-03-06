/* eslint-disable react/forbid-dom-props */
import React from 'react';

interface iPlayingCard {
  label: string;
}
const PlayingCard = ({ label }: iPlayingCard) => {
  //

  return (
    <div className="PlayingCard">
      <div style={{ position: 'absolute', top: 16, left: 16 }}>{label}</div>
      <div style={{ position: 'absolute', bottom: 16, right: 16 }}>{label}</div>
    </div>
  );
};

export { PlayingCard };
