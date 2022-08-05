import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './PlaceForm.css';

/* 사용자에 새로운 장소를 추가하는 부분 */
const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      code: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );

  const history = useHistory();

  const placeSubmitHandler = async event => {
    event.preventDefault();
    try {
      formState.inputs.code.value = formState.inputs.code.value.replaceAll("<br>", "\r\n");
      const formData = new FormData();
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('code', formState.inputs.code.value);
      formData.append('image', formState.inputs.image.value);
      await sendRequest(process.env.REACT_APP_BACKEND_URL + '/places', 'POST', formData, {
        Authorization: 'Bearer ' + auth.token
      });
      history.push('/');
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="제목"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="유효한 제목을 입력해주세요."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="노트"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="유효한 노트를 작성해주세요 (최소 5글자)."
          onInput={inputHandler}
        />
        <Input
          id="code"
          element="textarea"
          label="코드"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="유효한 코드를 작성해주세요 (최소 5글자)."
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="이미지를 선택해주세요."
        />
        <Button type="submit" disabled={!formState.isValid}>
          노트 추가
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewPlace;
