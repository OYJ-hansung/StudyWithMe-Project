import React from 'react';

import Modal from './Modal';
import Button from '../FormElements/Button';

const ErrorModal = props => {
  return (
    <Modal /* onSubmit이 없으므로 form이 생성되지 않는다. 단지 오류 메시지를 출력 */
      onCancel={props.onClear}
      header="오류가 발생했습니다!"
      show={!!props.error}
      footer={<Button onClick={props.onClear}>Okay</Button>}
    >
      <p>{props.error}</p>
    </Modal>
  );
};

export default ErrorModal;
