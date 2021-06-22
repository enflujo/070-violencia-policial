/* global L */
import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../selectors';
import mapboxgl from 'mapbox-gl';

class Map extends Component {
  constructor() {
    super();
    this.svgRef = createRef();
    this.map = null;
    this.state = {
      eventosCargados: false,
      puntosCargados: false,
      categoriasCargadas: false,
      estiloCargado: false,
      mapaCargado: false,
      mapTransformX: 0,
      mapTransformY: 0,
      eventoId: 0,
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
        this.setState({
          mapaCargado: true,
        });

        map.resize();
      });

      map.on('sourcedata', (e) => {
        if (e.isSourceLoaded && !this.state.estiloCargado) {
          this.setState({
            estiloCargado: true,
          });
        }
      });

      this.map = map;
    }
  }

  componentDidUpdate(prevProps) {
    /**
     * Aún no lo estamos usando pero acá hay un boceto de como cambiar el mapa y puntos de vista cuando cambiamos de historia
     */
    if (prevProps.historiaActual !== this.props.historiaActual) {
      this.setState({
        puntosCargados: false,
      });
      this.map.setStyle(this.props.propiedadesMapa.styleUrl);

      this.map.flyTo({
        center: this.props.propiedadesMapa.anchor,
        speed: 0.7,
        zoom: this.props.propiedadesMapa.startZoom,
      });
    }

    /**
     * Revisar si los datos de eventos están cargados
     */
    if (!this.state.eventosCargados && this.props.domain && this.props.domain.events.length) {
      this.setState({
        eventosCargados: true,
      });
    }

    if (!this.state.categoriasCargadas && this.props.domain && this.props.domain.categories.length) {
      this.setState({
        categoriasCargadas: true,
      });
    }

    const validateEventChange = (current, previous) => {
      if (current.length) {
        if (!previous.length) {
          return true;
        } else if (current.length !== previous.length) {
          return true;
        } else if (current[0].id !== previous[0].id) {
          return true;
        } else {
          return false;
        }
      }

      return false;
    };

    if (this.state.puntosCargados && this.props.app && this.props.app.map) {
      if (validateEventChange(this.props.app.selected, prevProps.app.selected)) {
        // Fly to first  of events selected
        const eventPoint = this.props.app.selected.length > 0 ? this.props.app.selected[0] : null;
        
        this.setState({
          eventoId: eventPoint.id
         });
        if (eventPoint !== null && eventPoint.latitude && eventPoint.longitude) {
          this.map.flyTo({
            center: [eventPoint.longitude, eventPoint.latitude],
            zoom: 18,
          });  
        }
      }
    }

    if (
      !this.state.puntosCargados &&
      this.state.eventosCargados &&
      this.state.categoriasCargadas &&
      this.state.estiloCargado &&
      this.state.mapaCargado
    ) {
      this.agregarDatosEventos();
    }
  }

  agregarDatosEventos() {
    if (!this.state.eventosCargados && !this.state.categoriasCargadas) {
      return;
    }
    /**
     * Definir los modos de clasificación: por categorias en este caso
     */
    const metodos = {};
    const comparacion = ['case'];
    const acumulacion = {};

    this.props.domain.categories.forEach(({ category }, i) => {
      const expresion = ['==', ['get', 'category'], category];
      metodos[category] = expresion;
      comparacion.push(expresion, this.props.methods.getCategoryColor(category));
      acumulacion[category] = ['+', ['case', expresion, 1, 0]];
    });
    comparacion.push('#CCC');

    const data = this.props.domain.events.map((d, idx) => {
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

    this.map.addSource('puntosEventos', {
      type: 'geojson',
      cluster: true,
      clusterRadius: 80,
      data: {
        type: 'FeatureCollection',
        features: data,
      },
      clusterProperties: acumulacion,
    });

    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'puntosEventos',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': comparacion,
        'circle-radius': this.props.ui.eventRadius,
      },
    });

    this.map.on('click', 'unclustered-point', (e) => {
      const features = this.map.queryRenderedFeatures(e.point);

      if (features.length >= 1) {
        const { idx } = features[0].properties;
        this.props.methods.onSelect(this.props.domain.events[idx]);
      }
    });

    this.map.on('mouseenter', 'unclustered-point', () => {
      this.map.getCanvas().style.cursor = 'crosshair';
    });

    this.map.on('mouseleave', 'unclustered-point', () => {
      this.map.getCanvas().style.cursor = '';
    });

    // objects for caching and keeping track of HTML marker objects (for performance)
    const markers = {};
    let markersOnScreen = {};

    const updateMarkers = () => {
      const newMarkers = {};
      const features = this.map.querySourceFeatures('puntosEventos');

      // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
      // and add it to the map if it's not there already
      for (let i = 0; i < features.length; i++) {
        const coords = features[i].geometry.coordinates;
        const props = features[i].properties;
        if (!props.cluster) continue;
        const id = props.cluster_id;
        let marker = markers[id];

        if (!marker) {
          const el = createDonutChart(props);
          el.style.cursor = 'zoom-in';
          el.onclick = () => {
            this.map.getSource('puntosEventos').getClusterLeaves(id, props.point_count, 0, (err, aFeatures) => {
              if (err) return;
              const eventosEnCluster = aFeatures.map(({ properties }) => {
                return this.props.domain.events[properties.idx];
              });
              this.props.methods.onSelect(eventosEnCluster);
            });

            this.map.getSource('puntosEventos').getClusterExpansionZoom(id, (err, zoom) => {
              if (err) return;
              this.map.easeTo({
                center: coords,
                zoom: zoom,
              });
            });
          };
          //

          marker = markers[id] = new mapboxgl.Marker({
            element: el,
          }).setLngLat(coords);
        }
        newMarkers[id] = marker;

        if (!markersOnScreen[id]) marker.addTo(this.map);
      }
      // for every marker we've added previously, remove those that are no longer visible
      for (const id in markersOnScreen) {
        if (!newMarkers[id]) markersOnScreen[id].remove();
      }
      markersOnScreen = newMarkers;
    };

    // after the GeoJSON data is loaded, update markers on the screen on every frame
    this.map.on('render', () => {
     
      //Obtener el hash (#) de la url y pasarlo como id
     const validateHash = () => {
        let pathHash = window.location.hash
        let eventoId= parseInt(pathHash)
        if (pathHash == "") {
          return ""
        } else {
          eventoId = pathHash.substr(1)
          return eventoId
        }
      }
      // Si la url tiene #, cargar el evento correspondiente
      let hashId = validateHash()
      if (hashId != "" && hashId < this.props.domain.events.length) {
        this.setState({
          eventoId: hashId
         });
        this.props.methods.onSelect(this.props.domain.events[hashId]);
      }

      if (!this.map.isSourceLoaded('puntosEventos')) return;
      updateMarkers();
    });

    // code for creating an SVG donut chart from feature properties
    const createDonutChart = (props) => {
      const offsets = [];
      const counts = [];

      this.props.domain.categories.forEach(({ category }) => {
        counts.push(props[category]);
      });

      let total = 0;
      for (let i = 0; i < counts.length; i++) {
        offsets.push(total);
        total += counts[i];
      }
      const fontSize = total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 13 : 10;
      const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
      const r0 = Math.round(r * 0.6);
      const w = r * 2;

      let html =
        `<div><svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" ` +
        `text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`;

      for (let i = 0; i < counts.length; i++) {
        const { category } = this.props.domain.categories[i];
        const color = this.props.methods.getCategoryColor(category);
        html += donutSegment(offsets[i] / total, (offsets[i] + counts[i]) / total, r, r0, color);
      }

      html +=
        `<circle cx="${r}" cy="${r}" r="${r0}" ` +
        `fill="#222423" /><text fill="#f5f3ed" dominant-baseline="central" transform="translate(${r}, ${r})">` +
        `${total.toLocaleString()}</text></svg></div>`;

      const el = document.createElement('div');
      el.innerHTML = html;

      return el.firstChild;
    };

    function donutSegment(start, end, r, r0, color) {
      if (end - start === 1) end -= 0.00001;
      const a0 = 2 * Math.PI * (start - 0.25);
      const a1 = 2 * Math.PI * (end - 0.25);
      const x0 = Math.cos(a0);
      const y0 = Math.sin(a0);
      const x1 = Math.cos(a1);
      const y1 = Math.sin(a1);
      const largeArc = end - start > 0.5 ? 1 : 0;
      const _x0 = r + r0 * x0;
      const _y0 = r + r0 * y0;

      return (
        `<path d="M ${_x0} ${_y0} L ${r + r * x0} ${r + r * y0}` +
        `A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1}` +
        `L ${r + r0 * x1} ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${_x0} ${_y0}"` +
        `fill="${color}" />`
      );
    }

    this.setState({
      puntosCargados: true,
      visitado: false
    });
  }

  render() {
    const classes = 'map-wrapper';

    // Antonia Evento Id - cargar
    
    
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
      categories: selectors.getCategories(state),
      sites: selectors.selectSites(state),
      shapes: selectors.selectShapes(state),
      events: selectors.selectEvents(state),
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