import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

export default function Login() {
  let history = useHistory();

  const OnSubmit = async e => {
    e.preventDefault();

    axios
      .post(
        'http://localhost:5000/api/v1/users/login',
        {
          email: email,
          password: password
        },
        { withCredentials: true }
      )
      .then(function(response) {
        if (response.data.status === 'success') {
          history.push('/overview');
        }
      })
      .catch(function(error) {
        if (error.response) {
          // Request made and server responded
          setStatus(error.response.data.message);
        } else if (error.request) {
          // The request was made but no response was received
          setStatus('Login failed, please try again');
        }
      });
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  return (
    <div className="container">
      <br />
      <div className="row" style={{ marginTop: 70 }}>
        <div className="col s4 offset-s4">
          <form onSubmit={OnSubmit} className="col s12">
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="email"
                  type="email"
                  className="validate"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <label htmlFor="email">Email</label>
              </div>
            </div>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="password"
                  type="password"
                  className="validate"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <label htmlFor="password">Password</label>
              </div>
            </div>
            <div className="row center-align">
              <i style={{ color: 'grey' }}>{status}</i>
            </div>

            <button className="btn right" action="submit" name="action">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
