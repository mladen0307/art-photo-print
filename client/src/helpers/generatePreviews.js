import { readAndCompressImage } from 'browser-image-resizer';

const configThumb = {
  quality: 0.4,
  maxWidth: 400,
  maxHeight: 400
};

const generatePreviews = async (files, callback) => {
  let newFiles = [];
  callback(0);
  for (let i = 0; i < files.length; i++) {
    newFiles[i] = files[i];
    newFiles[i].preview = URL.createObjectURL(
      await readAndCompressImage(newFiles[i], configThumb)
    );
    callback(i + 1);
  }
  return newFiles;
};

export default generatePreviews;
