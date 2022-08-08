import React, { useEffect, useContext, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

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
import { useLocation } from 'react-router-dom';
import './PlaceForm.css';

/* 사용자에 새로운 장소를 추가하는 부분 */
const SpecificPlace = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { placeId, title, code, image, creatorId } = location.state;
  const [loadedComments, setLoadedComments] = useState();
  const [formState, inputHandler] = useForm(
    {
       comment: {
        value: '',
        isValid: false
      }
    },
    false
  );

  const commentSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('comment', formState.inputs.comment.value);
      formData.append('placeId', placeId);
      formData.append('creatorId', creatorId);
      await sendRequest(process.env.REACT_APP_BACKEND_URL + '/places/comment', 'POST', formData, {
        Authorization: 'Bearer ' + auth.token
      });
      fetchComments();      
      // location.reload();
    } catch (err) {}
  };

  let comments;
  const fetchComments = async () => {
    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/comment/${placeId}`
      );
      setLoadedComments(responseData.comments);
      comments = responseData.comments;
      console.log(responseData.comments);        
    } catch (err) {}
  };
  useEffect(() => {    
    fetchComments();
  }, [sendRequest, placeId]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <div className='outer-div'>
        <div className="place-item__image">
              <img
                src={`${process.env.REACT_APP_ASSET_URL}/${image}`}
                alt={title}
              />
        </div>
      </div>
      <div className="place-item__info">
            <h2>{title}</h2>
            <br />
            <textarea className='textarea-border' value={code}></textarea>
      </div>      
      {!isLoading && loadedComments && (
        <ul>
          {loadedComments.map((comment, index)=>{
            return(<li key={index}>
              <h2>{comment.comment}</h2>             
            </li>)            
          })}
        </ul>
      )}              
      <form className="place-form-specific" onSubmit={commentSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="comment"
          element="input"
          type="text"
          label="댓글"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="유효한 댓글을 입력하세요."
          onInput={inputHandler}
          name="comment-input"
        />
        <footer className='footer-button'>
          <Button type="submit" disabled={!formState.isValid}>코멘트 작성</Button>       
        </footer>        
      </form>
    </React.Fragment>
  );
};

export default SpecificPlace;
