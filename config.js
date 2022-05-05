const rutaApi = process.env.NODE_ENV === 'production' ? process.env.URL_API : 'http://localhost:4040';

module.exports = {
  display_title: 'CARTOGRAFÍA DE LA VIOLENCIA POLICIAL',
  SERVER_ROOT: rutaApi,
  CAIS_EXT: '/api/gvp/cais/rows',
  EVENTOS_REPRESION: '/api/gvp/eventos/deeprows',
  EVENTOS_ESTAN_DISPARANDO: '/api/gvp/nueve_s/deeprows',
  STATIC_EXT: '/api/gvp/menus/columns',
  VICTIMAS_EXT: '/api/gvp/victimas/rows',
  FILTER_TREE_EXT: '/api/gvp/menus/columns',
  SITES_EXT: '',
  SHAPES_EXT: '',
  DATE_FMT: 'DD/MM/YYYY',
  TIME_FMT: 'hh:mm',
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  store: {
    historias: ['estanDisparando', 'represionMuerte'],
    app: {
      language: 'es-MX',
    },
    features: {
      USE_CATEGORIES: true,
      CATEGORIES_AS_FILTERS: true,
      USE_ASSOCIATIONS: false,
      USE_SOURCES: false,
      USE_COVER: false,
      USE_SITES: false,
      USE_SHAPES: false,
      GRAPH_NONLOCATED: false,
      HIGHLIGHT_GROUPS: false,
    },
  },
};
