/* global L */
import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../selectors';
import mapboxgl from 'mapbox-gl';

const PI_DOS = Math.PI * 2;

class Map extends Component {
  constructor() {
    super();
    this.svgRef = createRef();
    this.map = null;
    this.markers = {};
    this.markersOnScreen = {};
    this.state = {
      eventosCargados: false,
      categoriasCargadas: false,
      mapTransformX: 0,
      mapTransformY: 0,
    };
  }

  componentDidMount() {
    if (this.map === null) {
      mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: this.props.ui.dom.map,
        style: this.props.propiedadesMapa.styleUrl,
        center: this.props.propiedadesMapa.anchor,
        zoom: this.props.propiedadesMapa.startZoom,
      });

      map.on('load', () => {
        map.resize();
      });

      map.on('sourcedata', (e) => {
        if (e.isSourceLoaded && !map.getSource('puntosEventos')) {
          this.crearCapasMapa();
        }
      });

      map.on('click', 'puntoEvento', (e) => {
        const features = this.map.queryRenderedFeatures(e.point);

        if (features.length >= 1) {
          const { idx } = features[0].properties;
          this.props.methods.onSelect(this.props.eventos[idx]);
        }
      });

      map.on('mouseenter', 'puntoEvento', () => {
        this.map.getCanvas().style.cursor = 'crosshair';
      });

      map.on('mouseleave', 'puntoEvento', () => {
        this.map.getCanvas().style.cursor = '';
      });

      map.on('render', () => {
        const fuente = map.getSource('puntosEventos');
        if (fuente) {
          if (!this.map.isSourceLoaded('puntosEventos')) return;
          this.actualizarPuntos();
          this.renderCais();
        }
      });

      this.map = map;
    }
  }

  actualizarEstiloMapa() {
    this.map.setStyle(this.props.propiedadesMapa.styleUrl);
    this.map.flyTo({
      center: this.props.propiedadesMapa.anchor,
      speed: 0.7,
      zoom: this.props.propiedadesMapa.startZoom,
    });
  }

  crearGeojson() {
    return this.props.eventos.map((d, idx) => {
      return {
        type: 'Feature',
        properties: {
          category: d.category,
          idx: idx,
        },
        geometry: {
          type: 'Point',
          coordinates: [+d.longitude, +d.latitude],
        },
      };
    });
  }

  // Antes estaban los Cais, toca volverlos a poner
  renderCais() {
    const zoom = this.map.getZoom();
    if (!this.props.cais || zoom < 13) return;

    // const { x, y } = projectPoint([cai.latitude, cai.longitude])

    // return (
    //   <g
    //     key={`cai${i}`}
    //     className='place-cai'
    //     onMouseEnter={handleCaiOver}
    //     onMouseOut={handleCaiLeave}
    //     transform={`translate(${x}, ${y})`}
    //   >
    //     <text className='cai-name'>{cai.name}</text>
    //     <path
    //       className='cai-icon'
    //       width='110'
    //       height='12'
    //       transform={`scale(${zoomLevel ? zoomLevel / 11 : 1})`}
    //       fill='#68ba5e'
    //       d='M9.69,5.54c0,1-1.12,1.56-4.21,1.56S1.3,6.5,1.28,5.53c.75,0,2.19-1,4.2-1S9.06,5.54,9.69,5.54ZM5.48,7.59A13.4,13.4,0,0,1,3,7.39c0,.28.23,1.66,1.2,1.66S5,8.39,5.51,8.39s.58.66,1.43.66c1,0,1.23-1.53,1.24-1.7A12.28,12.28,0,0,1,5.48,7.59Zm3.21-.37a5,5,0,0,1-1.14,3.21,2.62,2.62,0,0,1-2,.85,2.64,2.64,0,0,1-2-.79,5.07,5.07,0,0,1-1.2-3.23,3.25,3.25,0,0,1-.74-.32A6,6,0,0,0,3.08,11a3.37,3.37,0,0,0,2.49,1,3.35,3.35,0,0,0,2.52-1.08,5.8,5.8,0,0,0,1.33-4A3.27,3.27,0,0,1,8.69,7.22ZM5.57,1.72,5.41,2l-.35,0,.25.24,0,.34.31-.16.31.16-.06-.34.26-.24L5.73,2Zm3.6-.1A20.16,20.16,0,0,1,5.5,0,20.16,20.16,0,0,1,1.83,1.62,14.57,14.57,0,0,1,0,4.13l1.13,1C1.9,5,3.45,4,5.5,4s3.6,1,4.37,1l1.13-1A14.57,14.57,0,0,1,9.17,1.62ZM6,3.23a.82.82,0,0,0-.44.2.75.75,0,0,0-.43-.2.67.67,0,0,1-.58-.65A1.64,1.64,0,0,1,4.71,2c.1-.25,0-.33-.06-.44l-.09-.08.5-.41a.34.34,0,0,0,.24.14.41.41,0,0,0,.27-.14.4.4,0,0,0,.26.14.34.34,0,0,0,.24-.14l.49.41-.08.08c-.1.11-.16.19-.06.45a1.77,1.77,0,0,1,.16.57A.67.67,0,0,1,6,3.23Z'
    //     />
    //     ¡{' '}
    //   </g>
    // )
  }

  crearCapasMapa() {
    const metodos = {};
    const comparacion = ['case'];
    const acumulacion = {};

    for (let categoria in this.props.colores) {
      if (categoria !== 'default') {
        const expresion = ['==', ['get', 'category'], categoria];
        metodos[categoria] = expresion;
        comparacion.push(expresion, this.props.colores[categoria]);
        acumulacion[categoria] = ['+', ['case', expresion, 1, 0]];
      }
    }

    comparacion.push('#CCC');

    const geojson = this.crearGeojson();

    this.map.addSource('puntosEventos', {
      type: 'geojson',
      cluster: true,
      clusterRadius: 80,
      data: {
        type: 'FeatureCollection',
        features: geojson,
      },
      clusterProperties: acumulacion,
    });

    this.map.addLayer({
      id: 'puntoEvento',
      type: 'circle',
      source: 'puntosEventos',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': comparacion,
        'circle-radius': this.props.ui.eventRadius,
      },
    });
  }

  actualizarPuntos() {
    const newMarkers = {};
    const features = this.map.querySourceFeatures('puntosEventos');

    for (let i = 0; i < features.length; i++) {
      const coords = features[i].geometry.coordinates;
      const props = features[i].properties;

      if (!props.cluster) continue;

      const id = props.cluster_id;
      let marker = this.markers[id];

      if (!marker) {
        const el = this.crearDona(props);

        if (!el) continue;

        el.style.cursor = 'zoom-in';
        el.onclick = () => {
          const fuente = this.map.getSource('puntosEventos');

          if (!fuente) return;

          fuente.getClusterLeaves(id, props.point_count, 0, (err, aFeatures) => {
            if (err) return;
            const eventosEnCluster = aFeatures.map(({ properties }) => {
              return this.props.eventos[properties.idx];
            });
            this.props.methods.onSelect(eventosEnCluster);
          });

          fuente.getClusterExpansionZoom(id, (err, zoom) => {
            if (err) return;
            this.map.easeTo({
              center: coords,
              zoom: zoom,
            });
          });
        };

        marker = this.markers[id] = new mapboxgl.Marker({
          element: el,
        }).setLngLat(coords);
      }
      newMarkers[id] = marker;
      if (!this.markersOnScreen[id]) marker.addTo(this.map);
    }

    for (const id in this.markersOnScreen) {
      if (!newMarkers[id]) this.markersOnScreen[id].remove();
    }
    this.markersOnScreen = newMarkers;
  }

  crearDona(props) {
    const offsets = [];
    const counts = [];

    this.props.categorias.forEach(({ category }) => {
      counts.push(props[category]);
    });

    let total = 0;
    for (let i = 0; i < counts.length; i++) {
      offsets.push(total);
      total += counts[i];
    }

    if (total === 0) return;

    const fontSize = total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 13 : 10;
    const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
    const r0 = Math.round(r * 0.6);
    const w = r * 2;

    let html =
      `<div><svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" ` +
      `text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`;

    for (let i = 0; i < counts.length; i++) {
      const { category } = this.props.categorias[i];
      const color = this.props.methods.getCategoryColor(category);
      html += this.segmentoDona(offsets[i] / total, (offsets[i] + counts[i]) / total, r, r0, color);
    }

    html +=
      `<circle cx="${r}" cy="${r}" r="${r0}" ` +
      `fill="#222423" /><text fill="#f5f3ed" dominant-baseline="central" transform="translate(${r}, ${r})">` +
      `${total.toLocaleString()}</text></svg></div>`;

    const el = document.createElement('div');
    el.innerHTML = html;

    return el.firstChild;
  }

  segmentoDona(start, end, r, r0, color) {
    if (end - start === 1) end -= 0.00001;
    const a0 = PI_DOS * (start - 0.25);
    const a1 = PI_DOS * (end - 0.25);
    const x0 = Math.cos(a0);
    const y0 = Math.sin(a0);
    const x1 = Math.cos(a1);
    const y1 = Math.sin(a1);
    const largeArc = end - start > 0.5 ? 1 : 0;
    const _x0 = r + r0 * x0;
    const _y0 = r + r0 * y0;
    if (isNaN(_x0)) {
      console.log(props, r, r0, start, end);
    }

    return (
      `<path d="M ${_x0} ${_y0} L ${r + r * x0} ${r + r * y0}` +
      `A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1}` +
      `L ${r + r0 * x1} ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${_x0} ${_y0}"` +
      `fill="${color}" />`
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.app.selected.length) {
      const { latitude, longitude } = this.props.app.selected[0];

      this.map.flyTo({
        center: [longitude, latitude],
        speed: 2.35,
        zoom: 18,
      });
    }
    if (prevProps.historiaActual == this.props.historiaActual) return;

    this.actualizarEstiloMapa();

    for (const id in this.markers) {
      this.markers[id].remove();
    }
    this.markers = {};
  }

  render() {
    const classes = 'map-wrapper';

    return (
      <div className={classes} onKeyDown={this.props.onKeyDown} tabIndex="0">
        <div id={this.props.ui.dom.map} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    domain: {
      locations: selectors.selectLocations(state),
      // categories: selectors.getCategories(state),
      sites: selectors.selectSites(state),
      shapes: selectors.selectShapes(state),
      // events: selectors.selectEvents(state),
    },
    app: {
      views: state.app.associations.views,
      selected: selectors.selectSelected(state),
      highlighted: state.app.highlighted,
      map: state.app.map,
      flags: {
        isShowingSites: state.app.flags.isShowingSites,
      },
    },
    ui: {
      tiles: state.ui.tiles,
      dom: state.ui.dom,
      mapSelectedEvents: state.ui.style.selectedEvents,
      shapes: state.ui.style.shapes,
      eventRadius: state.ui.eventRadius,
    },
    features: selectors.getFeatures(state),
  };
}

export default connect(mapStateToProps)(Map);
