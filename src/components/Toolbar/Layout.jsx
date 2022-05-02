import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actions from '../../actions';
import * as selectors from '../../selectors';

import BottomActions from './BottomActions.jsx';
import copy from '../../common/data/copy.json';
import EstanDispando from './historias/EstanDisparando.jsx';
import RepreseionMuerte from './historias/RepresionMuerte.jsx';

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _selected: -1,
    };
    this.infoRef = createRef();
  }

  selectTab(selected) {
    const _selected = this.state._selected === selected ? -1 : selected;
    this.setState({ _selected });
  }

  renderClosePanel() {
    return (
      <div className="panel-header" onClick={() => this.selectTab(-1)}>
        <div className="caret" />
      </div>
    );
  }

  renderToolbarPanels() {
    let classes = this.state._selected >= 0 ? 'toolbar-panels' : 'toolbar-panels folded';
    return <div className={classes}>{this.renderClosePanel()}</div>;
  }

  renderToolbarTabs() {
    let title = copy[this.props.language].toolbar.title;
    if (process.env.display_title) title = process.env.display_title;

    return (
      <div className="toolbar">
        <div className="toolbar-header" onClick={this.props.methods.onTitle}>
          <p>{title}</p>
        </div>
        <div className="toolbar-tabs">
          <div className="toolbar-tab" onClick={() => this.cuandoClic('estanDisparando')}>
            <i className="material-icons">star</i>
            <div className="tab-caption">Están Disparando #9S</div>
          </div>
          <div className="toolbar-tab" onClick={() => this.cuandoClic('represionMuerte')}>
            <i className="material-icons">request_quote</i>
            <div className="tab-caption">Represión y Muerte #28A</div>
          </div>
        </div>

        <BottomActions
          info={{
            enabled: this.props.infoShowing,
            toggle: this.props.actions.toggleInfoPopup,
          }}
          sites={{
            enabled: this.props.sitesShowing,
            toggle: this.props.actions.toggleSites,
          }}
          cover={{
            toggle: this.props.actions.toggleCover,
          }}
          features={this.props.features}
        />
      </div>
    );
  }

  handleClose = () => {
    this.infoRef.current.classList.add('hidden');
  };

  handleOpen = () => {
    this.infoRef.current.classList.remove('hidden');
  };

  cuandoClic(historia) {
    if (historia === this.props.historiaActual) {
      this.infoRef.current.classList.toggle('hidden');
    } else {
      this.infoRef.current.classList.remove('hidden');
      this.props.actualizarHistoria(historia);
    }
  }

  mostrarHistoria() {
    switch (this.props.historiaActual) {
      case 'estanDisparando':
        return <EstanDispando />;
      case 'represionMuerte':
        return <RepreseionMuerte eventos={this.props.eventos} />;
      default:
        return <EstanDispando />;
    }
  }

  render() {
    return (
      <div id="toolbar-wrapper" className="toolbar-wrapper">
        <article ref={this.infoRef} className="historiaInfo">
          <div className="closeBtn" onClick={this.handleClose}>
            X
          </div>

          {this.mostrarHistoria()}
        </article>
        {this.renderToolbarTabs()}
        {this.renderToolbarPanels()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    filters: selectors.getFilters(state),
    // categories: selectors.getCategories(state),
    language: state.app.language,
    activeFilters: selectors.getActiveFilters(state),
    activeCategories: selectors.getActiveCategories(state),
    viewFilters: state.app.associations.views,
    sitesShowing: state.app.flags.isShowingSites,
    infoShowing: state.app.flags.isInfopopup,
    features: selectors.getFeatures(state),
    // eventos: state.domain.events,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
