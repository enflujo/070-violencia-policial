let { DATE_FMT, TIME_FMT } = process.env;
if (!DATE_FMT) DATE_FMT = 'DD/MM/YYYY';
if (!TIME_FMT) TIME_FMT = 'hh:mm';

export function calcDatetime(date, time) {
  if (!time) time = '00:00';
  const formats = {
    date: DATE_FMT.split('/'),
    time: TIME_FMT.split(':'),
  };
  const d = date.split('/');
  const t = time.split(':');
  const dI = formats.date.indexOf('DD');
  const mI = formats.date.indexOf('MM');
  const yI = formats.date.indexOf('YYYY');
  const hoursI = formats.time.indexOf('hh');
  const minutesI = formats.time.indexOf('mm');

  return new Date(d[yI], d[mI] - 1, d[dI], t[hoursI], t[minutesI]).getTime();
}

/**
 * Get URI params to start with predefined set of
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 * @param {string} name: name of paramater to search
 * @param {string} url: url passed as variable, defaults to window.location.href
 */
export function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');

  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Compare two arrays of scalars
 * @param {array} arr1: array of numbers
 * @param {array} arr2: array of numbers
 */
export function areEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.every((element, index) => {
      return element === arr2[index];
    })
  );
}

/**
 * Return whether the variable is neither null nor undefined
 * @param {object} variable
 */
export function isNotNullNorUndefined(variable) {
  return typeof variable !== 'undefined' && variable !== null;
}

/*
 * Taken from: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
 */
export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function trimAndEllipse(string, stringNum) {
  if (string.length > stringNum) {
    return string.substring(0, 120) + '...';
  }
  return string;
}

/**
 * Inset the full source represenation from 'allSources' into an event. The
 * function is 'curried' to allow easy use with maps. To use for a single
 * source, call with two sets of parentheses:
 *      const src = insetSourceFrom(sources)(anEvent)
 */
export function insetSourceFrom(allSources) {
  return (event) => {
    let sources;
    if (!event.sources) {
      sources = [];
    } else {
      sources = event.sources.map((src) => {
        const id = typeof src === 'object' ? src.id : src;
        return allSources.hasOwnProperty(id) ? allSources[id] : null;
      });
    }
    return {
      ...event,
      sources,
    };
  };
}

/**
 * Debugging function: put in place of a mapStateToProps function to
 * view that source modal by default
 */
export function injectSource(id) {
  return (state) => {
    return {
      ...state,
      app: {
        ...state.app,
        source: state.domain.sources[id],
      },
    };
  };
}

export function urlFromEnv(ext) {
  if (process.env[ext]) {
    if (!Array.isArray(process.env[ext])) {
      return [`${process.env.SERVER_ROOT}${process.env[ext]}`];
    } else {
      return process.env[ext].map((suffix) => `${process.env.SERVER_ROOT}${suffix}`);
    }
  } else {
    return null;
  }
}

export function toggleFlagAC(flag) {
  return (appState) => ({
    ...appState,
    flags: {
      ...appState.flags,
      [flag]: !appState.flags[flag],
    },
  });
}

export function selectTypeFromPath(path) {
  let type;
  switch (true) {
    case /\.(png|jpg)$/.test(path):
      type = 'Image';
      break;
    case /\.(mp4)$/.test(path):
      type = 'Video';
      break;
    case /\.(md)$/.test(path):
      type = 'Text';
      break;
    default:
      type = 'Unknown';
      break;
  }
  return { type, path };
}

export function typeForPath(path) {
  let type;
  path = path.trim();
  switch (true) {
    case /\.((png)|(jpg)|(jpeg))$/.test(path):
      type = 'Image';
      break;
    case /\.(mp4)$/.test(path):
      type = 'Video';
      break;
    case /\.(md)$/.test(path):
      type = 'Text';
      break;
    case /\.(pdf)$/.test(path):
      type = 'Document';
      break;
    default:
      type = 'Unknown';
      break;
  }
  return type;
}

export function selectTypeFromPathWithPoster(path, poster) {
  return { type: typeForPath(path), path, poster };
}

export function calcOpacity(num) {
  /* Events have opacity 0.5 by default, and get added to according to how many
   * other events there are in the same render. The idea here is that the
   * overlaying of events builds up a 'heat map' of the event space, where
   * darker areas represent more events with proportion */
  const base = num >= 1 ? 0.6 : 0;
  return base + Math.min(0.5, 0.08 * (num - 1));
}

export const dateMin = function () {
  return Array.prototype.slice.call(arguments).reduce(function (a, b) {
    return a < b ? a : b;
  });
};

export const dateMax = function () {
  return Array.prototype.slice.call(arguments).reduce(function (a, b) {
    return a > b ? a : b;
  });
};

/** Taken from
 * https://stackoverflow.com/questions/22697936/binary-search-in-javascript
 * **/
export function binarySearch(ar, el, compareFn) {
  let m = 0;
  let n = ar.length - 1;
  while (m <= n) {
    const k = (n + m) >> 1;
    const cmp = compareFn(el, ar[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

export function makeNiceDate(datetime) {
  if (datetime === null) return null;
  // see https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
  const dateTimeFormat = new Intl.DateTimeFormat('es', { year: 'numeric', month: 'long', day: '2-digit' });
  const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(datetime);

  return `${day} ${month}, ${year}`;
}

export function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

/**
 * Simple is object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item) && item !== null;
}

/**
 * Deep merge two objects.
 * https://gist.github.com/Salakar/1d7137de9cb8b704e48a
 * @param target
 * @param source
 */
export function mergeDeep(target, source) {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }
  return target;
}
