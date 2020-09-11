import Resizer from 'react-image-file-resizer';

const resizeFiles = files => {
  let resizedFiles = [];
  files.forEach(file => {
    Resizer.imageFileResizer(
      file,
      500,
      500,
      'JPEG',
      100,
      0,
      uri => {
        let newFile = new File([uri], file.name, {
          lastModified: new Date().getTime(),
          type: uri.type
        });
        newFile.path = file.path;
        newFile.preview = file.preview;
        newFile.brojKomada = file.brojKomada;
        resizedFiles.push(newFile);
      },
      'blob'
    );
  });
  return resizedFiles;
};

export default resizeFiles;
