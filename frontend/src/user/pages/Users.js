import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => { // UseEffect에서는 async를 직접적으로 사용하지 않고 아래와 같이 함수를 생성해서 활용한다.
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL+'/users' /* 환경변수를 활용해 백엔드로 http요청을 보냄 > useHttpClient(커스텀 훅).sendRequest*/
        );
        setLoadedUsers(responseData.users);
      } catch (err) {}
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} /> {/* 팝업창으로 정의한 에러 메시지 */}
      {isLoading && (
        <div className="center">
          <LoadingSpinner /> {/* 로딩 */}
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />} {/* 로딩중이지 않고, 유저를 받아왔으면 유저목록을 보여줘라 > UserList */}
    </React.Fragment>
  );
};

export default Users;
