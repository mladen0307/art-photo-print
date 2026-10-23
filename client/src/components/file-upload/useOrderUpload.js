import { useEffect, useState } from 'react';
import axios from 'axios';
import M from 'materialize-css';

import resizeFile from '../../helpers/resizeFile';

const useOrderUpload = ({ files, userInfo, canSubmit }) => {
  const [fileUploadPercentage, setFileUploadPercentage] = useState([]);
  const [resultMessage, setResultMessage] = useState({
    status: '',
    message: ''
  });
  const [uploadFinishedSuccessfully, setUploadFinishedSuccessfully] = useState(
    false
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  useEffect(() => {
    setFileUploadPercentage(
      files.map(file => ({ name: file.name, value: 0 }))
    );
  }, [files]);

  const submitOrder = async event => {
    event.preventDefault();

    if (!canSubmit) {
      setResultMessage({
        status: 'fail',
        message: 'Cenovnik nije dostupan. Pokušajte ponovo kasnije.'
      });
      return;
    }

    setUploading(true);
    setResultMessage({ status: '', message: '' });
    setUploadProgress(0);

    const filesArr = Object.values(files);
    let uploadId;
    const photos = [];

    for (let i = 0; i < filesArr.length; i++) {
      try {
        const file = await resizeFile(filesArr[i]);
        if (!uploadId) {
          const sessionResponse = await axios.post('/api/v1/uploads/session');
          uploadId = sessionResponse.data.data.uploadId;
        }

        const signatureResponse = await axios.post(
          '/api/v1/uploads/signature',
          {
            uploadId,
            fileName: file.name,
            contentType: file.type,
            size: file.size
          }
        );
        const { key, url } = signatureResponse.data.data;

        await axios.put(url, file, {
          headers: {
            'Content-Type': file.type
          },
          onUploadProgress: progressEvent => {
            setFileUploadPercentage(current =>
              current.map(item =>
                item.name === file.name
                  ? {
                      ...item,
                      value: Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                      )
                    }
                  : item
              )
            );
          },
          withCredentials: false
        });

        photos.push({
          r2Key: key,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          brojKomada: filesArr[i].brojKomada
        });
        setUploadProgress(Math.round(((i + 1) * 100) / filesArr.length));
      } catch (error) {
        setUploadFinishedSuccessfully(false);
        M.toast({ html: 'Došlo je do greške' });
        setResultMessage({
          status: 'fail',
          message: 'Došlo je do greške, pokušajte ponovo'
        });
        setUploading(false);
        return;
      }
    }

    try {
      await axios.post(
        '/api/v1/orders',
        {
          ...userInfo,
          uploadId,
          photos
        },
        {
          withCredentials: true
        }
      );

      M.toast({ html: 'Fotografije su sačuvane' });
      setResultMessage({
        status: 'success',
        message: `Vaša porudžbenica je uspešno sačuvana, dobićete email obaveštenje na adresi ${userInfo.email}`
      });
      setUploading(false);
      setUploadFinishedSuccessfully(true);
    } catch (error) {
      setUploadFinishedSuccessfully(false);
      M.toast({ html: 'Došlo je do greške' });
      setResultMessage({
        status: 'fail',
        message: 'Došlo je do greške, pokušajte ponovo'
      });
      setUploading(false);
    }
  };

  return {
    fileUploadPercentage,
    resultMessage,
    uploadFinishedSuccessfully,
    uploading,
    uploadProgress,
    submitOrder
  };
};

export default useOrderUpload;
