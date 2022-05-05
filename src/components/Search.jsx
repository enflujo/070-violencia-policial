import React from 'react';

import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import * as actions from '../actions';

import '../scss/search.scss';

import SearchRow from './SearchRow.jsx';

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFolded: true,
    };
  }

  onButtonClick = () => {
    this.setState((prevState) => {
      return { isFolded: !prevState.isFolded };
    });
  };

  updateSearchQuery = (e) => {
    let queryString = e.target.value;
    this.props.actions.updateSearchQuery(queryString);
  };

  render() {
    let searchResults;

    const searchAttributes = ['description', 'location', 'category', 'date'];

    if (!this.props.queryString) {
      searchResults = [];
    } else {
      searchResults = this.props.eventos.filter((event) =>
        searchAttributes.some((attribute) => {
          if (event[attribute]) {
            return event[attribute].toLowerCase().includes(this.props.queryString.toLowerCase());
          }
          return '';
        })
      );
    }

    return (
      <div className="search-outer-container">
        <div id="search-bar-icon-container" onClick={this.onButtonClick}>
          <i className="material-icons">search</i>
        </div>
        <div className={'search-bar-overlay' + (this.state.isFolded ? ' folded' : '')}>
          <div className="search-input-container">
            <input className="search-bar-input" onChange={this.updateSearchQuery} type="text" />
            <i id="close-search-overlay" className="material-icons" onClick={this.onButtonClick}>
              close
            </i>
          </div>
          <div className="search-results">
            {searchResults.map((result) => {
              return (
                <SearchRow
                  onSearchRowClick={this.props.onSearchRowClick}
                  eventObj={result}
                  query={this.props.queryString}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect((state) => state, mapDispatchToProps)(Search);
