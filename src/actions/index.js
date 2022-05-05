/* global fetch */
import { urlFromEnv } from '../common/utilities';

// TODO: relegate these URLs entirely to environment variables
const SOURCES_URL = urlFromEnv('SOURCES_EXT');

export function fetchDomain() {
  const notifications = [];

  function handleError(message) {
    notifications.push({
      message,
      type: 'error',
    });
    return [];
  }

  return async (dispatch, getState) => {
    dispatch(toggleFetchingDomain());

    const promesaEstanDisparando = fetch(urlFromEnv('EVENTOS_ESTAN_DISPARANDO'))
      .then((response) => response.json())
      .catch(() => handleError('eventosNueveS'));

    const promesaRepresion = fetch(urlFromEnv('EVENTOS_REPRESION'))
      .then((response) => response.json())
      .catch(() => handleError('eventosRepresion'));

    const promesaCais = fetch(urlFromEnv('CAIS_EXT'))
      .then((response) => response.json())
      .catch(() => handleError('cais'));

    const promesaVictimas = fetch(urlFromEnv('VICTIMAS_EXT'))
      .then((response) => response.json())
      .catch(() => handleError('victimas'));

    try {
      const result = {
        estanDisparando: {
          eventos: await promesaEstanDisparando,
          cais: await promesaCais,
          victimas: await promesaVictimas,
        },
        represionMuerte: {
          eventos: await promesaRepresion,
        },
        associations: [],
        notifications,
      };

      result.eventos = result.estanDisparando.eventos;

      if (Object.values(result).some((resp) => resp.hasOwnProperty('error'))) {
        throw new Error('Some URLs returned negative. If you are in development, check the server is running');
      }
      dispatch(toggleFetchingDomain());
      return result;
    } catch (err) {
      dispatch(fetchError(err.message));
      dispatch(toggleFetchingDomain());
      console.log(err);
    }
  };
}

export const FETCH_ERROR = 'FETCH_ERROR';
export function fetchError(message) {
  return {
    type: FETCH_ERROR,
    message,
  };
}

export const UPDATE_DOMAIN = 'UPDATE_DOMAIN';
export function updateDomain(payload) {
  return {
    type: UPDATE_DOMAIN,
    payload,
  };
}

export function fetchSource(source) {
  return (dispatch) => {
    if (!SOURCES_URL) {
      dispatch(fetchSourceError('No source extension specified.'));
    } else {
      dispatch(toggleFetchingSources());

      fetch(`${SOURCES_URL}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('No sources are available at the URL specified in the config specified.');
          } else {
            return response.json();
          }
        })
        .catch((err) => {
          dispatch(fetchSourceError(err.message));
          dispatch(toggleFetchingSources());
        });
    }
  };
}

export const UPDATE_HIGHLIGHTED = 'UPDATE_HIGHLIGHTED';
export function updateHighlighted(highlighted) {
  return {
    type: UPDATE_HIGHLIGHTED,
    highlighted: highlighted,
  };
}

export const UPDATE_SELECTED = 'UPDATE_SELECTED';
export function updateSelected(selected) {
  return {
    type: UPDATE_SELECTED,
    selected: selected,
  };
}

export const UPDATE_DISTRICT = 'UPDATE_DISTRICT';
export function updateDistrict(district) {
  return {
    type: UPDATE_DISTRICT,
    district,
  };
}

export const CLEAR_FILTER = 'CLEAR_FILTER';
export function clearFilter(filter) {
  return {
    type: CLEAR_FILTER,
    filter,
  };
}

export const TOGGLE_FILTER = 'TOGGLE_FILTER';
export function toggleFilter(filter, value) {
  return {
    type: TOGGLE_FILTER,
    filter,
    value,
  };
}

export const SET_LOADING = 'SET_LOADING';
export function setLoading() {
  return {
    type: SET_LOADING,
  };
}

export const SET_NOT_LOADING = 'SET_NOT_LOADING';
export function setNotLoading() {
  return {
    type: SET_NOT_LOADING,
  };
}

export const UPDATE_TIMERANGE = 'UPDATE_TIMERANGE';
export function updateTimeRange(timerange) {
  return {
    type: UPDATE_TIMERANGE,
    timerange,
  };
}

export const UPDATE_DIMENSIONS = 'UPDATE_DIMENSIONS';
export function updateDimensions(dims) {
  return {
    type: UPDATE_DIMENSIONS,
    dims,
  };
}

export const UPDATE_SOURCE = 'UPDATE_SOURCE';
export function updateSource(source) {
  return {
    type: UPDATE_SOURCE,
    source,
  };
}

// UI

export const TOGGLE_SITES = 'TOGGLE_SITES';
export function toggleSites() {
  return {
    type: TOGGLE_SITES,
  };
}

export const TOGGLE_FETCHING_DOMAIN = 'TOGGLE_FETCHING_DOMAIN';
export function toggleFetchingDomain() {
  return {
    type: TOGGLE_FETCHING_DOMAIN,
  };
}

export const TOGGLE_FETCHING_SOURCES = 'TOGGLE_FETCHING_SOURCES';
export function toggleFetchingSources() {
  return {
    type: TOGGLE_FETCHING_SOURCES,
  };
}

export const TOGGLE_LANGUAGE = 'TOGGLE_LANGUAGE';
export function toggleLanguage(language) {
  return {
    type: TOGGLE_LANGUAGE,
    language,
  };
}

export const CLOSE_TOOLBAR = 'CLOSE_TOOLBAR';
export function closeToolbar() {
  return {
    type: CLOSE_TOOLBAR,
  };
}

export const TOGGLE_INFOPOPUP = 'TOGGLE_INFOPOPUP';
export function toggleInfoPopup() {
  return {
    type: TOGGLE_INFOPOPUP,
  };
}

export const TOGGLE_NOTIFICATIONS = 'TOGGLE_NOTIFICATIONS';
export function toggleNotifications() {
  return {
    type: TOGGLE_NOTIFICATIONS,
  };
}

export const MARK_NOTIFICATIONS_READ = 'MARK_NOTIFICATIONS_READ';
export function markNotificationsRead() {
  return {
    type: MARK_NOTIFICATIONS_READ,
  };
}

export const TOGGLE_COVER = 'TOGGLE_COVER';
export function toggleCover() {
  return {
    type: TOGGLE_COVER,
  };
}

export const UPDATE_SEARCH_QUERY = 'UPDATE_SEARCH_QUERY';
export function updateSearchQuery(searchQuery) {
  return {
    type: UPDATE_SEARCH_QUERY,
    searchQuery,
  };
}

// ERRORS

export const FETCH_SOURCE_ERROR = 'FETCH_SOURCE_ERROR';
export function fetchSourceError(msg) {
  return {
    type: FETCH_SOURCE_ERROR,
    msg,
  };
}

export const ACTUALIZAR_HISTORIA = 'ACTUALIZAR_HISTORIA';
export function actualizarHistoria(nombre) {
  return {
    type: ACTUALIZAR_HISTORIA,
    nombre,
  };
}
