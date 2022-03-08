import React, { useState, useEffect } from 'react';
import FileUpload from './pages/FileUpload';
import Overview from './pages/Overview';
import Nav from './layout/Nav';
import Login from './pages/Login';
import OrderDetails from './pages/OrderDetails';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import UserContext from './context/UserContext';
import Footer from './layout/Footer';

function App() {
  const [userData, setUserData] = useState({
    token: undefined,
    email: undefined,
    name: undefined
  });

  return (
    <React.Fragment>
      <Router>
        <UserContext.Provider value={{ userData, setUserData }}>
          <Nav />
          <main>
            <Switch>
              <Route path="/" exact component={FileUpload}></Route>
              <Route path="/upload" exact component={FileUpload}></Route>
              <Route path="/overview" exact component={Overview}></Route>
              <Route
                path="/overview/:id"
                exact
                component={OrderDetails}
              ></Route>
              <Route path="/login" exact component={Login}></Route>
            </Switch>
          </main>
          <Footer></Footer>
        </UserContext.Provider>
      </Router>
    </React.Fragment>
  );
}

export default App;
