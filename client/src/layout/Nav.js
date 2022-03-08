import React from 'react';
import logo from '../logos.png';

export default function Nav() {
  return (
    <React.Fragment>
      <header>
        <nav>
          <div className="nav-wrapper black">
            <a href="https://fotoartnis.com/" className="brand-logo">
              <img src={logo} alt="foto art logo" width="220px" height="auto" />
            </a>
            <a href="#" data-target="mobile-demo" className="sidenav-trigger">
              <i className="material-icons">menu</i>
            </a>
            <ul
              className="right hide-on-med-and-down"
              style={{ fontFamily: 'Mulish', marginRight: '25px' }}
            >
              <li>
                <a href="https://fotoartnis.com/">Home</a>
              </li>
              <li>
                <a href="https://fotoartnis.com/usluge">Usluge</a>
              </li>
              <li>
                <a href="https://fotoartnis.com/galerija">Galerija</a>
              </li>
              <li>
                <a href="https://fotoartnis.com/kontakt">Kontakt</a>
              </li>
            </ul>
          </div>
        </nav>

        <ul className="sidenav" id="mobile-demo">
          <li>
            <a href="https://fotoartnis.com/">Home</a>
          </li>
          <li>
            <a href="https://fotoartnis.com/usluge">Usluge</a>
          </li>
          <li>
            <a href="https://fotoartnis.com/galerija">Galerija</a>
          </li>
          <li>
            <a href="https://fotoartnis.com/kontakt">Kontakt</a>
          </li>
        </ul>
      </header>
    </React.Fragment>
  );
}
