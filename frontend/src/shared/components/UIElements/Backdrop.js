import React from 'react';
import ReactDOM from 'react-dom';

import './Backdrop.css';

//클릭시 캔슬을 정의

const Backdrop = props => {
  return ReactDOM.createPortal(
    <div className="backdrop" onClick={props.onClick}></div>,
    document.getElementById('backdrop-hook')
  );
};

export default Backdrop;
