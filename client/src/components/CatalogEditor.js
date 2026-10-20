import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const getErrorMessage = error =>
  error.response && error.response.data && error.response.data.message
    ? error.response.data.message
    : 'Podešavanja cenovnika nisu mogla biti učitana.';

const CatalogEditor = () => {
  const history = useHistory();
  const [formats, setFormats] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [newFormatName, setNewFormatName] = useState('');
  const [newFormatPrice, setNewFormatPrice] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();

    const loadCatalog = async () => {
      try {
        const userResponse = await axios.get('/api/v1/users/me', {
          cancelToken: cancelToken.token,
          withCredentials: true
        });
        if (userResponse.data.data.user.role !== 'admin') {
          history.replace('/overview');
          return;
        }

        setIsAdmin(true);
        const catalogResponse = await axios.get('/api/v1/catalog', {
          cancelToken: cancelToken.token
        });
        setFormats(catalogResponse.data.data.catalog.formats);
        setActiveTab(0);
      } catch (requestError) {
        if (axios.isCancel(requestError)) return;
        if (requestError.response && requestError.response.status === 401) {
          history.push('/login');
          return;
        }
        setError(getErrorMessage(requestError));
      } finally {
        if (!cancelToken.token.reason) setLoading(false);
      }
    };

    loadCatalog();
    return () => cancelToken.cancel();
  }, [history]);

  const updateFormat = (formatIndex, update) => {
    setFormats(currentFormats =>
      currentFormats.map((format, index) =>
        index === formatIndex ? { ...format, ...update } : format
      )
    );
    setMessage('');
    setError('');
  };

  const updateTier = (formatIndex, tierIndex, field, value) => {
    const format = formats[formatIndex];
    const quantityTiers = format.quantityTiers.map((tier, index) =>
      index === tierIndex ? { ...tier, [field]: value } : tier
    );
    updateFormat(formatIndex, { quantityTiers });
  };

  const addTier = formatIndex => {
    const format = formats[formatIndex];
    const lastTier = format.quantityTiers[format.quantityTiers.length - 1];
    if (!Number.isSafeInteger(lastTier.minPhotos)) return;

    const nextMinPhotos = lastTier.minPhotos + 100;
    if (!Number.isSafeInteger(nextMinPhotos)) return;

    updateFormat(formatIndex, {
      quantityTiers: [
        ...format.quantityTiers,
        {
          minPhotos: nextMinPhotos,
          maxPhotos: null,
          price: lastTier.price
        }
      ]
    });
  };

  const removeTier = (formatIndex, tierIndex) => {
    const format = formats[formatIndex];
    updateFormat(formatIndex, {
      quantityTiers: format.quantityTiers.filter(
        (tier, index) => index !== tierIndex
      )
    });
  };

  const addFormat = event => {
    event.preventDefault();
    const name = newFormatName.trim();
    const price = Number(newFormatPrice);
    if (
      !name ||
      name.length > 40 ||
      formats.some(format => format.name.toLowerCase() === name.toLowerCase()) ||
      newFormatPrice === '' ||
      !Number.isSafeInteger(price) ||
      price < 0
    ) {
      setError(
        'Unesite jedinstven naziv formata (najviše 40 karaktera) i važeću cenu.'
      );
      return;
    }

    const newFormat = {
      name,
      enabled: true,
      quantityTiers: [{ minPhotos: 0, maxPhotos: null, price }]
    };
    setFormats(currentFormats => [...currentFormats, newFormat]);
    setActiveTab(formats.length);
    setNewFormatName('');
    setNewFormatPrice('');
    setError('');
    setMessage('');
  };

  const saveCatalog = async event => {
    event.preventDefault();
    setError('');
    setMessage('');

    const hasInvalidTiers = formats.some(format => {
      if (!format.quantityTiers.length) return true;
      let previousMinPhotos = -1;

      return format.quantityTiers.some(tier => {
        const valid =
          Number.isSafeInteger(tier.minPhotos) &&
          (previousMinPhotos === -1
            ? tier.minPhotos === 0
            : tier.minPhotos > previousMinPhotos) &&
          Number.isSafeInteger(tier.price) &&
          tier.price >= 0;
        if (valid) previousMinPhotos = tier.minPhotos;
        return !valid;
      });
    });

    if (hasInvalidTiers || !formats.some(format => format.enabled)) {
      setError(
        'Proverite početne količine i cene. Prvi prag mora biti 0, pragovi moraju rasti, a najmanje jedan format mora biti dostupan.'
      );
      return;
    }

    const payload = {
      formats: formats.map(format => ({
        name: format.name,
        enabled: format.enabled,
        quantityTiers: format.quantityTiers.map((tier, index) => ({
          minPhotos: tier.minPhotos,
          maxPhotos:
            index === format.quantityTiers.length - 1
              ? null
              : format.quantityTiers[index + 1].minPhotos - 1,
          price: tier.price
        }))
      }))
    };

    setSaving(true);
    try {
      const response = await axios.patch('/api/v1/catalog', payload, {
        withCredentials: true
      });
      setFormats(response.data.data.catalog.formats);
      setMessage('Cenovnik je sačuvan.');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <section className="card">
      <div className="card-content">
        <span className="card-title">Cene i dostupni formati</span>
        {error && <p className="red-text">{error}</p>}
        {message && <p className="green-text">{message}</p>}
        {error && formats.length === 0 ? null : (
          <form onSubmit={saveCatalog}>
            <div
              className="row"
              role="tablist"
              aria-label="Formati i dodavanje formata"
            >
              {formats.map((format, formatIndex) => (
                <button
                  key={format.name}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === formatIndex}
                  aria-controls={`catalog-panel-${formatIndex}`}
                  id={`catalog-tab-${formatIndex}`}
                  className={`btn-flat ${
                    activeTab === formatIndex ? 'indigo white-text' : ''
                  }`}
                  onClick={() => setActiveTab(formatIndex)}
                >
                  {format.name}
                </button>
              ))}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === formats.length}
                aria-controls="catalog-panel-add"
                id="catalog-tab-add"
                className={`btn-flat ${
                  activeTab === formats.length ? 'indigo white-text' : ''
                }`}
                onClick={() => setActiveTab(formats.length)}
              >
                <i className="material-icons left">add</i>
                Dodaj format
              </button>
            </div>

            {formats.map((format, formatIndex) => (
              <div
                className="card-panel"
                key={format.name}
                role="tabpanel"
                id={`catalog-panel-${formatIndex}`}
                aria-labelledby={`catalog-tab-${formatIndex}`}
                hidden={activeTab !== formatIndex}
              >
                <div className="row" style={{ marginBottom: 0 }}>
                  <div className="col s8">
                    <h6>{format.name}</h6>
                  </div>
                  <div className="col s4 right-align">
                    <label>
                      <input
                        type="checkbox"
                        checked={format.enabled}
                        disabled={saving}
                        onChange={event =>
                          updateFormat(formatIndex, {
                            enabled: event.target.checked
                          })
                        }
                      />
                      <span>Dostupan format</span>
                    </label>
                  </div>
                </div>

                <div className="row" style={{ marginBottom: 0 }}>
                  {format.quantityTiers.map((tier, tierIndex) => {
                    const isLastTier =
                      tierIndex === format.quantityTiers.length - 1;
                    const maxPhotos = isLastTier
                      ? null
                      : format.quantityTiers[tierIndex + 1].minPhotos - 1;

                    return (
                      <div className="row" key={`${format.name}-${tierIndex}`}>
                        <div className="input-field col s5 m4">
                          <input
                            id={`${format.name}-tier-${tierIndex}-min`}
                            type="number"
                            min="0"
                            step="1"
                            value={tier.minPhotos}
                            disabled={saving || tierIndex === 0}
                            onChange={event =>
                              updateTier(
                                formatIndex,
                                tierIndex,
                                'minPhotos',
                                event.target.value === ''
                                  ? ''
                                  : Number(event.target.value)
                              )
                            }
                          />
                          <label
                            className="active"
                            htmlFor={`${format.name}-tier-${tierIndex}-min`}
                          >
                            Od broja fotografija
                          </label>
                        </div>
                        <div className="input-field col s5 m4">
                          <input
                            id={`${format.name}-tier-${tierIndex}-price`}
                            type="number"
                            min="0"
                            step="1"
                            value={tier.price}
                            disabled={saving}
                            onChange={event =>
                              updateTier(
                                formatIndex,
                                tierIndex,
                                'price',
                                event.target.value === ''
                                  ? ''
                                  : Number(event.target.value)
                              )
                            }
                          />
                          <label
                            className="active"
                            htmlFor={`${format.name}-tier-${tierIndex}-price`}
                          >
                            Cena po fotografiji (RSD)
                          </label>
                        </div>
                        <div className="col s2 m4" style={{ paddingTop: 20 }}>
                          <span>
                            {isLastTier
                              ? 'i više'
                              : `do ${maxPhotos} fotografija`}
                          </span>
                          {tierIndex > 0 && (
                            <button
                              type="button"
                              className="btn-flat red-text"
                              disabled={saving}
                              onClick={() =>
                                removeTier(formatIndex, tierIndex)
                              }
                              aria-label={`Ukloni cenovni nivo ${tierIndex + 1} za format ${format.name}`}
                            >
                              <i className="material-icons">delete</i>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="btn-flat indigo-text"
                  disabled={
                    saving ||
                    !Number.isSafeInteger(
                      format.quantityTiers[format.quantityTiers.length - 1]
                        .minPhotos
                    )
                  }
                  onClick={() => addTier(formatIndex)}
                >
                  <i className="material-icons left">add</i>
                  Dodaj cenovni nivo
                </button>
              </div>
            ))}
            <div
              className="card-panel"
              role="tabpanel"
              id="catalog-panel-add"
              aria-labelledby="catalog-tab-add"
              hidden={activeTab !== formats.length}
            >
              <h6>Dodavanje novog formata</h6>
              <p>Početna cena važi za sve količine dok ne dodate još nivoa.</p>
              <div className="row">
                <div className="input-field col s12 m6">
                  <input
                    id="new-format-name"
                    type="text"
                    maxLength="40"
                    value={newFormatName}
                    disabled={saving}
                    onChange={event => setNewFormatName(event.target.value)}
                  />
                  <label className="active" htmlFor="new-format-name">
                    Naziv formata
                  </label>
                </div>
                <div className="input-field col s12 m6">
                  <input
                    id="new-format-price"
                    type="number"
                    min="0"
                    step="1"
                    value={newFormatPrice}
                    disabled={saving}
                    onChange={event => setNewFormatPrice(event.target.value)}
                  />
                  <label className="active" htmlFor="new-format-price">
                    Cena po fotografiji (RSD)
                  </label>
                </div>
              </div>
              <button
                type="button"
                className="btn-flat indigo-text"
                disabled={saving}
                onClick={addFormat}
              >
                Dodaj format
              </button>
            </div>
            <button
              type="submit"
              className={`btn ${saving ? 'disabled' : ''}`}
              disabled={saving}
            >
              {saving ? 'Čuvanje...' : 'Sačuvaj cenovnik'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default CatalogEditor;
