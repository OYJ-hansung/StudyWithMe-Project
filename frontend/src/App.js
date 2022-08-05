import React, {Suspense} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

// import Users from './user/pages/Users';
// import NewPlace from './places/pages/NewPlace';
// import UserPlaces from './places/pages/UserPlaces';
// import UpdatePlace from './places/pages/UpdatePlace';
// import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';


//lazy를 통해서 해당 모듈을 사용할때만 이를 불러오기. 효율적인 속도 향성 방법
const Users = React.lazy(()=>import('./user/pages/Users'));
const NewPlace = React.lazy(()=>import('./places/pages/NewPlace'));
const UserPlaces = React.lazy(()=>import('./places/pages/UserPlaces'));
const UpdatePlace = React.lazy(()=>import('./places/pages/UpdatePlace'));
const Auth = React.lazy(()=>import('./user/pages/Auth'));

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />  {/* 처음 화면 users 탭 > Users.js*/} 
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces /> {/* 사용자에 해당하는 장소 목록 이동 */}
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />  {/* 새로운 장소를 등록 */}
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace /> {/* 장소를 업데이트 하는 부분 */}
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces /> {/* 빠져도 되지 않나? */}
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main><Suspense fallback={<div className='center'><LoadingSpinner/></div>}>{routes}</Suspense></main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
