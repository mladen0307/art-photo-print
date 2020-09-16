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
    if (files[i].size > 3145728) {
      compressed[i] = await readAndCompressImage(files[i], config);
      compressed[i].name = files[i].name;
      compressed[i].lastModified = files[i].lastModified;
      compressed[i].path = files[i].path;
    } else {
      compressed[i] = files[i];
    }
    callback(i + 1);
  }
  return compressed;
};

export default resizeFiles;
