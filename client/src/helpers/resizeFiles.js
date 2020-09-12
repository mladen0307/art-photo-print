import { readAndCompressImage } from 'browser-image-resizer';

const config = {
  quality: 0.7,
  maxWidth: 3000,
  maxHeight: 3000
};

const resizeFiles = async (files, callback) => {
  let compressed = [];
  callback(0);
  for (let i = 0; i < files.length; i++) {
    compressed[i] = await readAndCompressImage(files[i], config);
    callback(i + 1);
    compressed[i].name = files[i].name;
    compressed[i].lastModified = files[i].lastModified;
    compressed[i].path = files[i].path;
  }
  return compressed;
};

export default resizeFiles;
