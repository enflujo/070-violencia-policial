import initial from '../store/initial.js';
import { toggleFlagAC } from '../common/utilities';

import {
  UPDATE_HIGHLIGHTED,
  UPDATE_SELECTED,
  CLEAR_FILTER,
  TOGGLE_FILTER,
  UPDATE_TIMERANGE,
  UPDATE_DIMENSIONS,
  UPDATE_SOURCE,
  TOGGLE_LANGUAGE,
  TOGGLE_SITES,
  TOGGLE_FETCHING_DOMAIN,
  TOGGLE_FETCHING_SOURCES,
  TOGGLE_INFOPOPUP,
  TOGGLE_NOTIFICATIONS,
  TOGGLE_COVER,
  FETCH_ERROR,
  FETCH_SOURCE_ERROR,
  SET_LOADING,
  SET_NOT_LOADING,
  UPDATE_SEARCH_QUERY,
  ACTUALIZAR_HISTORIA,
} from '../actions';

function updateHighlighted(appState, action) {
  return Object.assign({}, appState, {
    highlighted: action.highlighted,
  });
}

function updateSelected(appState, action) {
  return Object.assign({}, appState, {
    selected: action.selected,
  });
}

function toggleFilter(appState, action) {
  if (!(action.value instanceof Array)) {
    action.value = [action.value];
  }

  let newFilters = appState.associations.filters.slice(0);
  action.value.forEach((vl) => {
    if (newFilters.includes(vl)) {
      newFilters = newFilters.filter((s) => s !== vl);
    } else {
      newFilters.push(vl);
    }
  });

  return {
    ...appState,
    associations: {
      ...appState.associations,
      filters: newFilters,
    },
  };
}

function clearFilter(appState, action) {
  return {
    ...appState,
    filters: {
      ...appState.filters,
      [action.filter]: [],
    },
  };
}

function updateTimeRange(appState, action) {
  // XXX
  return {
    ...appState,
    timeline: {
      ...appState.timeline,
      range: action.timerange,
    },
  };
}

function updateDimensions(appState, action) {
  return {
    ...appState,
    timeline: {
      ...appState.timeline,
      dimensions: {
        ...appState.timeline.dimensions,
        ...action.dims,
      },
    },
  };
}

function toggleLanguage(appState, action) {
  const otherLanguage = appState.language === 'es-MX' ? 'en-US' : 'es-MX';
  return Object.assign({}, appState, {
    language: action.language || otherLanguage,
  });
}

function updateSource(appState, action) {
  return {
    ...appState,
    source: action.source,
  };
}

function fetchError(state, action) {
  return {
    ...state,
    error: action.message,
    notifications: [{ type: 'error', message: action.message }],
  };
}

const toggleSites = toggleFlagAC('isShowingSites');
const toggleFetchingDomain = toggleFlagAC('isFetchingDomain');
const toggleFetchingSources = toggleFlagAC('isFetchingSources');
const toggleInfoPopup = toggleFlagAC('isInfopopup');
const toggleNotifications = toggleFlagAC('isNotification');
const toggleCover = toggleFlagAC('isCover');

function fetchSourceError(appState, action) {
  return {
    ...appState,
    errors: {
      ...appState.errors,
      source: action.msg,
    },
  };
}

function setLoading(appState) {
  return {
    ...appState,
    loading: true,
  };
}

function setNotLoading(appState) {
  return {
    ...appState,
    loading: false,
  };
}

function updateSearchQuery(appState, action) {
  return {
    ...appState,
    searchQuery: action.searchQuery,
  };
}

function actualizarHistoria(appState, action) {
  return {
    ...appState,
    historiaActual: action.nombre,
  };
}

function app(appState = initial.app, action) {
  switch (action.type) {
    case UPDATE_HIGHLIGHTED:
      return updateHighlighted(appState, action);
    case UPDATE_SELECTED:
      return updateSelected(appState, action);
    case CLEAR_FILTER:
      return clearFilter(appState, action);
    case TOGGLE_FILTER:
      return toggleFilter(appState, action);
    case UPDATE_TIMERANGE:
      return updateTimeRange(appState, action);
    case UPDATE_DIMENSIONS:
      return updateDimensions(appState, action);
    case UPDATE_SOURCE:
      return updateSource(appState, action);
    /* toggles */
    case TOGGLE_LANGUAGE:
      return toggleLanguage(appState, action);
    case TOGGLE_SITES:
      return toggleSites(appState);
    case TOGGLE_FETCHING_DOMAIN:
      return toggleFetchingDomain(appState);
    case TOGGLE_FETCHING_SOURCES:
      return toggleFetchingSources(appState);
    case TOGGLE_INFOPOPUP:
      return toggleInfoPopup(appState);
    case TOGGLE_NOTIFICATIONS:
      return toggleNotifications(appState);
    case TOGGLE_COVER:
      return toggleCover(appState);
    /* errors */
    case FETCH_ERROR:
      return fetchError(appState, action);
    case FETCH_SOURCE_ERROR:
      return fetchSourceError(appState, action);
    case SET_LOADING:
      return setLoading(appState);
    case SET_NOT_LOADING:
      return setNotLoading(appState);
    case UPDATE_SEARCH_QUERY:
      return updateSearchQuery(appState, action);
    case ACTUALIZAR_HISTORIA:
      return actualizarHistoria(appState, action);
    default:
      return appState;
  }
}

export default app;
