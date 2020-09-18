import React from 'react';
import instaIcon from '../instagram.png';
import facebookIcon from '../facebook.png';

const Footer = () => {
  return (
    <footer className="page-footer black" style={{ fontFamily: 'Mulish' }}>
      <div className="container">
        <div className="row ">
          <div className="col m4 s12">
            <p className="grey-text text-lighten-4">O nama</p>
            <p className="grey-text text-lighten-4">
              Foto Art je fotografska radnja sa sedištem u Nišu koja pruža
              usluge iz oblasti digitalne štampe, fotografije, foto i video
              produkcije.
            </p>
          </div>
          <div className="col m4 s12 center-align">
            <a href="https://www.facebook.com/NisFotoArt">
              <img
                src={facebookIcon}
                width="48"
                style={{ marginRight: 20, marginTop: 20 }}
              ></img>
            </a>
            <a href="https://www.instagram.com/fotoartnis/">
              <img src={instaIcon} width="48"></img>
            </a>
          </div>
          <div className="col m4 s12">
            <p className="grey-text text-lighten-4">Kontakt</p>
            <ul>
              <li>
                <i
                  className="material-icons"
                  style={{ verticalAlign: '-6px', marginRight: 5 }}
                >
                  place
                </i>
                Karadžićeva 12, Niš
              </li>
              <li>
                <i
                  className="material-icons"
                  style={{ verticalAlign: '-6px', marginRight: 5 }}
                >
                  place
                </i>
                Bulevar Svetog cara Konstantina bb lokal 10, Niš
              </li>
              <li>
                <i
                  className="material-icons"
                  style={{ verticalAlign: '-6px', marginRight: 5 }}
                >
                  local_phone
                </i>
                064 64 75 683
              </li>
              <li>
                <i
                  className="material-icons"
                  style={{ verticalAlign: '-6px', marginRight: 5 }}
                >
                  local_phone
                </i>
                064 11 44 959
              </li>
              <li>
                <i
                  className="material-icons"
                  style={{ verticalAlign: '-6px', marginRight: 4 }}
                >
                  mail
                </i>
                foto.art.nis@hotmail.com
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
