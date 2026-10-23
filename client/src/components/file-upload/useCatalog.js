import { useEffect, useState } from 'react';
import axios from 'axios';

const useCatalog = setUserInfo => {
  const [catalogFormats, setCatalogFormats] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    setCatalogLoading(true);
    setCatalogError('');

    axios
      .get('/api/v1/catalog', { cancelToken: cancelToken.token })
      .then(response => {
        const formats = response.data.data.catalog.formats.filter(
          format => format.enabled
        );

        if (formats.length === 0) {
          setCatalogFormats([]);
          setCatalogError('Trenutno nema dostupnih formata za poručivanje.');
          return;
        }

        setCatalogFormats(formats);
        setUserInfo(current => ({
          ...current,
          format: formats.some(format => format.name === current.format)
            ? current.format
            : formats[0].name
        }));
      })
      .catch(error => {
        if (axios.isCancel(error)) return;

        setCatalogFormats([]);
        setCatalogError(
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'Cenovnik nije moguće učitati. Proverite internet vezu i pokušajte ponovo.'
        );
      })
      .finally(() => {
        if (!cancelToken.token.reason) setCatalogLoading(false);
      });

    return () => cancelToken.cancel();
  }, [requestId, setUserInfo]);

  const retryCatalog = () => setRequestId(current => current + 1);

  return {
    catalogFormats,
    catalogLoading,
    catalogError,
    retryCatalog
  };
};

export default useCatalog;
