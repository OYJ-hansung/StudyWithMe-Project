import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './PlaceItem.css';
import { Link } from 'react-router-dom';
/* 장소의 정보를 보여주는 페이지 */
const PlaceItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showDetail, setShowDetail] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openMapHandler = () => setShowDetail(true);

  const closeMapHandler = () => setShowDetail(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/${props.id}`,
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      props.onDelete(props.id);
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal /* 하위 버튼에서 '자세히 보기'을 클릭했을시 show가 true가 되면서 visible */
        show={showDetail}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={
          <dev>
            <Button onClick={closeMapHandler}>코멘트 작성</Button>
            <Button onClick={closeMapHandler}>닫기</Button>
          </dev>
      }
      >
        <div className="place-item__image">
            <img
              src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`}
              alt={props.title}
            />
        </div>
        <div className="place-item__info">
            <h2>{props.title}</h2>
            <br />
            <textarea value={props.code}></textarea>
        </div>
      </Modal>
      <Modal /* 하위 버튼에서 삭제을 클릭했을시 showConfirmModal = true가 되면서 visible */
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              취소
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              삭제
            </Button>
          </React.Fragment>
        }
      >
        <p>
          정말 해당 알고리즘 노트를 지우시겠습니까? 지운 후에는 복구를 할 수 없습니다.
        </p>
      </Modal>
      <li className="place-item"> {/* 본격적인 구체적인 장소에 대한 정보를 표기하는 부분 */}
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img
              src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <p>{props.description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse to={{
                pathname: `/places/specific/${props.id}`,
                state: {
                  placeId: props.id,
                  title: props.title,
                  code: props.code,
                  image: props.image,
                  creatorId: props.creatorId
                },
              }} >
              자세히
            </Button>         
      
            {auth.userId === props.creatorId && (
              <Button to={`/places/${props.id}`}>수정</Button>
            )}

            {auth.userId === props.creatorId && (
              <Button danger onClick={showDeleteWarningHandler}>
                삭제
              </Button>
            )}
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
