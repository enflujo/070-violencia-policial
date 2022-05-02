/* global alert, Event */
import React, { Component } from 'react';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';

// Globals and utilities
import * as actions from '../actions';
import * as selectors from '../selectors';
import colors from '../common/global';
import { binarySearch } from '../common/utilities';

// Interface sections
import Map from './Map.jsx';
import Timeline from './Timeline.jsx';

// Interface components
import LoadingOverlay from './Overlay/Loading.jsx';
import Toolbar from './Toolbar/Layout.jsx';
import CardStack from './CardStack.jsx';
import InfoPopUp from './InfoPopup.jsx';
import Notification from './Notification.jsx';
import Search from './Search.jsx';

class Layout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      muertos: [],
      historiaActual: null,
      historias: {
        estanDisparando: {
          mapa: {
            styleUrl: 'mapbox://styles/juancgonza/ckobpms3r1bxb17oa5jbdy53s',
            anchor: [-74.057, 4.619],
            startZoom: 11,
            minZoom: 6,
            maxZoom: 18,
            bounds: null,
            maxBounds: [
              [180, -180],
              [-180, 180],
            ],
          },
        },
        represionMuerte: {
          mapa: {
            styleUrl: 'mapbox://styles/juancgonza/ckphofn3b1i8q17ppt2bp7p3r?optimize=true',
            anchor: [-77.477, 1.012],
            startZoom: 5,
            minZoom: 6,
            maxZoom: 18,
            bounds: null,
            maxBounds: [
              [180, -180],
              [-180, 180],
            ],
          },
        },
      },
    };
  }

  componentDidMount() {
    const promise = this.props.actions.fetchDomain();

    if (promise) {
      promise.then((domain) => {
        this.props.actions.updateDomain({ domain });
        this.actualizarHistoria(this.props.app.historiaActual);
      });
    }
  }

  componentDidUpdate() {
    // if (!this.state.muertos.length && this.props.domain && this.props.domain.events.length) {
    //   const muertos = this.props.domain.events
    //     .filter((event) => {
    //       return event.category === 'Muerto';
    //     })
    //     .map((event) => event.nombre_victima);
    //   if (muertos.length) {
    //     this.setState({
    //       muertos: muertos,
    //     });
    //   }
    // }
  }

  handleHighlight = (highlighted) => {
    this.props.actions.updateHighlighted(highlighted || null);
  };

  handleViewSource = (source) => {
    this.props.actions.updateSource(source);
  };

  findEventIdx = (theEvent) => {
    return binarySearch(this.props.eventos, theEvent, (theev, otherev) => {
      return theev.datetime - otherev.datetime;
    });
  };

  handleSelect = (selected, axis) => {
    let matchedEvents = [];
    const TIMELINE_AXIS = 0;
    if (axis === TIMELINE_AXIS) {
      // find in events
      const { eventos } = this.props;

      const fechaSelecionado = selected.datetime.getTime();
      matchedEvents = eventos.filter((event) => {
        return event.datetime.getTime() === fechaSelecionado;
      });
    } else {
      if (Array.isArray(selected)) {
        selected.forEach((event) => matchedEvents.push(event));
      } else {
        // const std = { ...selected };
        matchedEvents.push(selected);
      }
    }

    this.props.actions.updateSelected(matchedEvents);
  };

  getCategoryColor = (category) => {
    if (!this.props.features.USE_CATEGORIES) {
      return colors.fallbackEventColor;
    }

    const cat = this.props.ui.style.categories[category];
    if (cat) {
      return cat;
    } else {
      return this.props.ui.style.categories['default'];
    }
  };

  onKeyDown = (e) => {
    const { selected } = this.props.app;
    const { eventos } = this.props;

    const prev = (idx) => {
      this.handleSelect(eventos[idx - 1], 0);
    };
    const next = (idx) => {
      this.handleSelect(eventos[idx + 1], 0);
    };
    if (selected.length > 0) {
      const ev = selected[selected.length - 1];
      const idx = this.findEventIdx(ev);
      switch (e.keyCode) {
        case 37: // left arrow
        case 38: // up arrow
          if (idx <= 0) return;
          prev(idx);
          break;
        case 39: // right arrow
        case 40: // down arrow
          if (idx < 0 || idx >= this.props.domain.length - 1) return;
          next(idx);
          break;
        default:
      }
    }
  };

  actualizarHistoria = (nombre) => {
    this.props.actions.actualizarHistoria(nombre);
  };

  render() {
    const { actions, app, domain, ui } = this.props;
    if (!domain[app.historiaActual]) return;
    const { eventos, categorias, cais } = domain[app.historiaActual];

    return (
      <div>
        {/* Este es el que contiene el menu y la historia */}
        <Toolbar
          eventos={eventos}
          historiaActual={app.historiaActual}
          actualizarHistoria={this.actualizarHistoria}
          methods={{
            onTitle: actions.toggleCover,
            onSelectFilter: (filter) => actions.toggleFilter('filters', filter),
            onCategoryFilter: (category) => actions.toggleFilter('categories', category),
          }}
        />
        {/* Acá esta la instancia del mapa */}
        <Map
          historiaActual={app.historiaActual}
          eventos={eventos}
          categorias={categorias}
          colores={ui.style.categories}
          cais={cais}
          propiedadesMapa={this.state.historias[app.historiaActual].mapa}
          onKeyDown={this.onKeyDown}
          methods={{
            getCategoryColor: this.getCategoryColor,
            onSelect: (ev) => this.handleSelect(ev, 1),
          }}
        />
        <Timeline
          eventos={eventos}
          categorias={categorias}
          onKeyDown={this.onKeyDown}
          rango={domain.historias[app.historiaActual].rango}
          methods={{
            onSelect: (ev) => this.handleSelect(ev, 0),
            onUpdateTimerange: actions.updateTimeRange,
            getCategoryColor: this.getCategoryColor,
            actualizarRangoTiempo: actions.updateTimeRange,
          }}
        />
        <CardStack
          timelineDims={app.timeline.dimensions}
          onViewSource={this.handleViewSource}
          onSelect={this.handleSelect}
          onHighlight={this.handleHighlight}
          onToggleCardstack={() => actions.updateSelected([])}
          getCategoryColor={this.getCategoryColor}
        />
        <InfoPopUp
          ui={ui}
          app={app}
          methods={{
            onClose: actions.toggleInfoPopup,
          }}
        />
        <Notification
          isNotification={app.flags.isNotification}
          notifications={domain.notifications}
          onToggle={actions.markNotificationsRead}
        />
        <Search queryString={app.searchQuery} eventos={eventos} onSearchRowClick={this.handleSelect} />
        <LoadingOverlay
          isLoading={app.loading || app.flags.isFetchingDomain}
          ui={app.flags.isFetchingDomain}
          language={app.language}
        />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(
  (state) => ({
    ...state,
    selected: selectors.selectSelected(state),
  }),
  mapDispatchToProps
)(Layout);
