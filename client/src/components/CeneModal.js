import React from 'react';
import cene from './../helpers/cene';

const CeneModal = () => {
  return (
    <div id="modal2" className="modal modal-fixed-footer">
      <div className="modal-content">
        <h6>Cene formata</h6>
        <table className="centered">
          <thead>
            <tr>
              <th>veličina formata</th>
              <th>cena u din.</th>
              <th> {">"}100 fotografija</th>
              <th> {">"}200 fotografija</th>
              <th> {">"}400 fotografija</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(cene).map(format => (
              <tr key={format}>
                <td>{format}</td>
                <td>{cene[format][0]}</td>
                <td>{cene[format][1]}</td>
                <td>{cene[format][2]}</td>
                <td>{cene[format][3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal-footer">
        <a className="modal-close waves-effect  btn-flat">Ok</a>
      </div>
    </div>
  );
};

export default CeneModal;
