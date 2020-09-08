import React from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <React.Fragment>
      <nav className="center-align teal lighten-1">
        <Link
          to="/upload"
          className="waves-effect waves-teal btn-flat  white-text"
        >
          Order Images
        </Link>
        <Link
          to="/overview"
          className="waves-effect waves-teal btn-flat  white-text"
        >
          Overview
        </Link>
      </nav>
    </React.Fragment>
  );
};
export default Nav;
