import React from 'react';

import copy from '../../../common/data/copy.json';

function isValidURL(string) {
  const res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

const getVideos = (videos) => {
  if (videos && videos.length) {
    return videos.map((fileName, i) => {
      return (
        <video key={fileName} className="video" width="550" height="380" controls>
          <source src={`./videos/${fileName}.mp4`} type="video/mp4" />
        </video>
      );
    });
  }
};

const getImages = (imgs) => {
  if (imgs && imgs.length) {
    return imgs.map((fileName, i) => {
      return <img key={fileName} className="img" width="550" src={`./imgs/${fileName}.jpg`} />;
    });
  }
};

const getVictimName = (nombre) => {
  if (nombre) {
    return (
      <p className="nombre-muerto">
        <span className="star" />
        {nombre}
        <span className="star" />
      </p>
    );
  }

  return null;
};

const getSource = (source) => {
  const sources = source
    .trim()
    .split('https')
    .filter((s) => !!s)
    .map((s) => {
      if (s.charAt(0) === ':') {
        return `https${s}`;
      } else {
        return s;
      }
    });

  const res = [];

  if (sources.length) {
    sources.forEach((s, idx) => {
      let fuente = '';

      if (isValidURL(s)) {
        fuente = (
          <p key={`fuente-${idx}`} className="fuente">
            <a href={s} target="_blank">
              {`Fuente ${idx + 1}`}
            </a>
          </p>
        );
      } else {
        fuente = (
          <p key={`fuente-${idx}`} className="fuente">
            {s}
          </p>
        );
      }

      res.push(fuente);
    });

    return res;
  }

  return null;
};

const CardSummary = ({ language, data, categoryColor }) => {
  //
  const summary = copy[language].cardstack.description;
  const nombre = getVictimName(data.nombre_victima);
  const fuente = getSource(data.fuente);
  const filters = data.filters.map((filter, idx) => {
    return (
      <span key={`filter-${idx}`} className="category-filter">
        {filter}
      </span>
    );
  });
  return (
    <div className="card-row summary">
      <div className="card-cell">
        <p
          className="card-categoria"
          style={{
            backgroundColor: categoryColor,
            color: 'white',
            display: 'inline-block',
            padding: '.3em',
            margin: '.3em 0',
          }}
        >
          {data.category}
        </p>
        {filters}
        {nombre}
        <h4>{summary}</h4>
        <p>{data.description}</p>
        {getVideos(data.videos)}
        {getImages(data.imgs)}
        {fuente}
        <p className="enlace" ><a href={'/#' + data.id} target="_blank" rel="noopener noreferrer"> Comparte este evento </a></p>
      </div>
    </div>
  );
};

export default CardSummary;