import React from 'react';
import { connect } from 'react-redux';
import * as selectors from '../selectors';

import Card from './Card.jsx';
import copy from '../common/data/copy.json';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


class CardStack extends React.Component {
  constructor(props) {
    super(props);
    this.refs = {};
    this.refCardStack = React.createRef();
    this.refCardStackContent = React.createRef();
  }

  renderCards(events, selections) {
    // if no selections provided, select all
    if (!selections) {
      selections = events.map((e) => true);
    }
    this.refs = [];

    return events.map((event, idx) => {
      const thisRef = React.createRef();
      this.refs[idx] = thisRef;

      return (
        <Card
          key={`card-${idx}`}
          event={event}
          ref={thisRef}
          sourceError={this.props.sourceError}
          language={this.props.language}
          isLoading={this.props.isLoading}
          isSelected={selections[idx]}
          getCategoryGroup={this.props.getCategoryGroup}
          getCategoryColor={this.props.getCategoryColor}
          getCategoryLabel={this.props.getCategoryLabel}
          onViewSource={this.props.onViewSource}
          onHighlight={this.props.onHighlight}
          onSelect={this.props.onSelect}
          idx={idx}
          features={this.props.features}
        />
      );
    });
  }

  renderSelectedCards() {
    const { selected } = this.props;
    if (selected.length > 0) {
      return this.renderCards(selected);
    }
    return null;
  }
  // Al cerrar el card stack se borra el hash #
  renderCardStackHeader() {
    const headerLang = copy[this.props.language].cardstack.header;

    return (
      <div id="card-stack-header" className="card-stack-header" onClick={() => this.props.onToggleCardstack()}>
        <Router>
          <Link to="/" replace ><button className="side-menu-burg is-active">  <span />
          </button>
          </Link>
        </Router>

        <p className="header-copy top">{`${this.props.selected.length} ${headerLang}`}</p>
      </div>
    );
  }

  renderCardStackContent() {
    return (
      <div id="card-stack-content" className="card-stack-content">
        <ul>{this.renderSelectedCards()}</ul>
      </div>
    );
  }

  render() {
    const { isCardstack, selected } = this.props;

    if (selected.length > 0) {
      return (
        <div
          id="card-stack"
          className={`card-stack
          ${isCardstack ? '' : ' folded'}`}
        >
          {this.renderCardStackHeader()}
          {this.renderCardStackContent()}

        </div>
      );
    }

    return <div />;
  }
}

function mapStateToProps(state) {
  return {
    selected: selectors.selectSelected(state),
    sourceError: state.app.errors.source,
    language: state.app.language,
    isCardstack: state.app.flags.isCardstack,
    isLoading: state.app.flags.isFetchingSources,
    features: state.features,
  };
}

export default connect(mapStateToProps)(CardStack);