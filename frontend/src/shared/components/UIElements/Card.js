import React from 'react';

import './Card.css';

// 컴포넌트를 받을 수 있는 틀
const Card = props => {
  return (
    <div className={`card ${props.className}`} style={props.style}>
      {props.children}
    </div>
  );
};

export default Card;
