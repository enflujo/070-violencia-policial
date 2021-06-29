import React, { Component, createRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { timeMinute, timeSecond } from 'd3-time';
import { scaleTime } from 'd3-scale';
import * as selectors from '../selectors';
import { setLoading, setNotLoading } from '../actions';

import copy from '../common/data/copy.json';
import Header from './presentational/Timeline/Header.jsx';
import Axis from './TimelineAxis.jsx';
import Markers from './presentational/Timeline/Markers.jsx';
import Events from './presentational/Timeline/Events.jsx';
import Categories from './TimelineCategories.jsx';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.svgRef = createRef();
    this.state = {
      isFolded: false,
      dims: props.dimensions,
      scaleX: null,
      scaleY: null,
      timerange: [null, null], // two datetimes
      dragPos0: null,
      transitionDuration: 300,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.computeDims);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.timerange !== this.state.timerange) {
      this.setState({
        scaleX: this.makeScaleX(),
      });
      // for some reason the timeline was not rendered even witht the previous solution to fire a resize event on componentDidMount
      this.computeDims();
    }

    if (this.props.app && this.props.app.timeline && this.props.app.timeline.range) {
      if (JSON.stringify(this.props.app.timeline.range) !== JSON.stringify(this.state.timerange)) {
        this.setState({
          timerange: this.props.app.timeline.range,
        });
        this.computeDims();
      }
    }

    if (
      JSON.stringify(this.props.domain.categories) !== JSON.stringify(prevProps.domain.categories) ||
      JSON.stringify(this.props.dimensions) !== JSON.stringify(prevProps.dimensions)
    ) {
      const { trackHeight, marginTop } = this.props.dimensions;
      this.setState({
        scaleY: this.makeScaleY(this.props.domain.categories, trackHeight, marginTop),
      });
      this.computeDims();
    }
  }

  makeScaleX() {
    return scaleTime()
      .domain(this.state.timerange)
      .range([this.state.dims.marginLeft, this.state.dims.width - this.state.dims.width_controls]);
  }

  makeScaleY(categories, trackHeight, marginTop) {
    const { features } = this.props;
    if (features.GRAPH_NONLOCATED && features.GRAPH_NONLOCATED.categories) {
      categories = categories.filter((cat) => !features.GRAPH_NONLOCATED.categories.includes(cat.category));
    }
    const catHeight = trackHeight / categories.length;
    const shiftUp = trackHeight / categories.length / 2;
    const marginShift = marginTop === 0 ? 0 : marginTop;
    const manualAdjustment = trackHeight <= 60 ? (trackHeight <= 30 ? -8 : -5) : 0;
    const catsYpos = categories.map((g, i) => {
      return (i + 1) * catHeight - shiftUp + marginShift + manualAdjustment;
    });
    const catMap = categories.map((c) => c.category);
    return (cat) => {
      const idx = catMap.indexOf(cat);
      return catsYpos[idx];
    };
  }

  /**
   * Returns the time scale (x) extent in minutes
   */
  getTimeScaleExtent() {
    if (!this.state.scaleX) return 0;
    const timeDomain = this.state.scaleX.domain();
    return (timeDomain[1].getTime() - timeDomain[0].getTime()) / 60000;
  }

  onClickArrow() {
    this.setState((prevState) => {
      return { isFolded: !prevState.isFolded };
    });
  }

  computeDims = () => {
    const dom = this.props.ui.dom.timeline;
    if (document.querySelector(`#${dom}`) !== null) {
      const boundingClient = document.querySelector(`#${dom}`).getBoundingClientRect();

      this.setState(
        {
          dims: {
            ...this.props.dimensions,
            width: boundingClient.width,
          },
        },
        () => {
          this.setState({ scaleX: this.makeScaleX() });
        }
      );
    }
  };

  /**
   * Shift time range by moving forward or backwards
   * @param {String} direction: 'forward' / 'backwards'
   */
  onMoveTime(direction) {
    this.props.methods.onSelect();
    const extent = this.getTimeScaleExtent();
    const newCentralTime = timeMinute.offset(this.state.scaleX.domain()[0], extent / 2);

    // if forward
    let domain0 = newCentralTime;
    let domainF = timeMinute.offset(newCentralTime, extent);

    // if backwards
    if (direction === 'backwards') {
      domain0 = timeMinute.offset(newCentralTime, -extent);
      domainF = newCentralTime;
    }

    this.setState({ timerange: [domain0, domainF] }, () => {
      this.props.methods.onUpdateTimerange(this.state.timerange);
    });
  }

  onCenterTime(newCentralTime) {
    const extent = this.getTimeScaleExtent();

    const domain0 = timeMinute.offset(newCentralTime, -extent / 2);
    const domainF = timeMinute.offset(newCentralTime, +extent / 2);

    this.setState({ timerange: [domain0, domainF] }, () => {
      this.props.methods.onUpdateTimerange(this.state.timerange);
    });
  }

  /**
   * Change display of time range
   * WITHOUT updating the store, or data shown.
   * Used for updates in the middle of a transition, for performance purposes
   */
  onSoftTimeRangeUpdate(timerange) {
    this.setState({ timerange });
  }

  /**
   * Apply zoom level to timeline
   * @param {object} zoom: zoom level from zoomLevels
   */
  onApplyZoom = (zoom) => {
    const extent = this.getTimeScaleExtent();
    const newCentralTime = timeMinute.offset(this.state.scaleX.domain()[0], extent / 2);
    const { rangeLimits } = this.props.app.timeline;

    let newDomain0 = timeMinute.offset(newCentralTime, -zoom.duration / 2);
    let newDomainF = timeMinute.offset(newCentralTime, zoom.duration / 2);

    if (rangeLimits) {
      // If the store contains absolute time limits,
      // make sure the zoom doesn't go over them
      const minDate = rangeLimits[0];
      const maxDate = rangeLimits[1];

      if (newDomain0 < minDate) {
        newDomain0 = minDate;
        newDomainF = timeMinute.offset(newDomain0, zoom.duration);
      }
      if (newDomainF > maxDate) {
        newDomainF = maxDate;
        newDomain0 = timeMinute.offset(newDomainF, -zoom.duration);
      }
    }

    this.setState({ timerange: [newDomain0, newDomainF] }, () => {
      this.props.methods.onUpdateTimerange(this.state.timerange);
    });
  };

  toggleTransition(isTransition) {
    this.setState({ transitionDuration: isTransition ? 300 : 0 });
  }

  /*
   * Setup drag behavior
   */
  onDragStart = (event) => {
    event.sourceEvent.stopPropagation();
    this.setState(
      {
        dragPos0: event.x,
      },
      () => {
        this.toggleTransition(false);
      }
    );
  };

  /*
   * Drag and update
   */
  onDrag = (event) => {
    const drag0 = this.state.scaleX.invert(this.state.dragPos0).getTime();
    const dragNow = this.state.scaleX.invert(event.x).getTime();
    const timeShift = (drag0 - dragNow) / 1000;

    const { range, rangeLimits } = this.props.app.timeline;
    let newDomain0 = timeSecond.offset(range[0], timeShift);
    let newDomainF = timeSecond.offset(range[1], timeShift);

    if (rangeLimits) {
      // If the store contains absolute time limits,
      // make sure the zoom doesn't go over them
      const minDate = rangeLimits[0];
      const maxDate = rangeLimits[1];

      newDomain0 = newDomain0 < minDate ? minDate : newDomain0;
      newDomainF = newDomainF > maxDate ? maxDate : newDomainF;
    }

    // Updates components without updating timerange
    this.onSoftTimeRangeUpdate([newDomain0, newDomainF]);
  };

  /**
   * Stop dragging and update data
   */
  onDragEnd = () => {
    this.toggleTransition(true);
    this.props.methods.onUpdateTimerange(this.state.timerange);
  };

  getDatetimeX = (datetime) => this.state.scaleX(datetime);

  getY = (event) => {
    const { features, domain } = this.props;
    const { USE_CATEGORIES, GRAPH_NONLOCATED } = features;

    if (!USE_CATEGORIES) {
      return this.state.dims.trackHeight / 2;
    }

    const { category, project } = event;
    if (GRAPH_NONLOCATED && GRAPH_NONLOCATED.categories.includes(category)) {
      return this.state.dims.marginTop + domain.projects[project].offset + this.props.ui.eventRadius;
    }
    if (!this.state.scaleY) return 0;

    return this.state.scaleY(category);
  };

  /**
   * Determines additional styles on the <circle> for each location.
   * A location consists of an array of events (see selectors). The function
   * also has full access to the domain and redux state to derive values if
   * necessary. The function should return an array, where the value at the
   * first index is a styles object for the SVG at the location, and the value
   * at the second index is an optional additional component that renders in
   * the <g/> div.
   */
  styleDatetime = (timestamp, category) => {
    return [null, null];
  };

  render() {
    if (!this.props.domain.events.length) return null;
    
    let classes = `timeline-wrapper ${this.state.isFolded ? ' folded' : ''}`;
    const { dims } = this.state;
    const foldedStyle = { bottom: this.state.isFolded ? -dims.height : '58px' };
    const heightStyle = { height: dims.height };
    const extraStyle = { ...heightStyle, ...foldedStyle };
    const contentHeight = { height: dims.contentHeight };
    const { categories } = this.props.domain;

    return (
      <div className={classes} style={extraStyle} onKeyDown={this.props.onKeyDown} tabIndex="1">
        <Header
          title={copy[this.props.app.language].timeline.info}
          from={this.state.timerange[0]}
          to={this.state.timerange[1]}
          onClick={() => {
            this.onClickArrow();
          }}
        />
        <div className="timeline-content" style={heightStyle}>
          <div id={this.props.ui.dom.timeline} className="timeline" style={contentHeight}>
            <svg ref={this.svgRef} width={dims.width} style={contentHeight}>
              {/* <Clip dims={dims} /> */}
              <Axis
                dims={dims}
                extent={this.getTimeScaleExtent()}
                transitionDuration={this.state.transitionDuration}
                scaleX={this.state.scaleX}
              />
              <Categories
                dims={dims}
                getCategoryY={(category) => this.getY({ category, project: null })}
                onDragStart={this.onDragStart}
                onDrag={this.onDrag}
                onDragEnd={this.onDragEnd}
                categories={this.props.domain.categories}
                features={this.props.features}
                getCategoryColor={this.props.methods.getCategoryColor}
              />
              {/* <ZoomControls
                extent={this.getTimeScaleExtent()}
                zoomLevels={this.props.app.timeline.zoomLevels}
                dims={dims}
                onApplyZoom={this.onApplyZoom}
              /> */}
              <Markers
                dims={dims}
                selected={this.props.app.selected}
                getEventX={(ev) => this.getDatetimeX(ev.datetime)}
                getEventY={this.getY}
                transitionDuration={this.state.transitionDuration}
                styles={this.props.ui.styles}
                features={this.props.features}
                eventRadius={this.props.ui.eventRadius}
              />
              <Events
                events={this.props.domain.events}
                projects={this.props.domain.projects}
                styleDatetime={this.styleDatetime}
                getDatetimeX={this.getDatetimeX}
                getY={this.getY}
                getHighlights={(group) => {
                  if (group === 'None') {
                    return [];
                  }
                  return categories.map((c) => c.group === group);
                }}
                getCategoryColor={this.props.methods.getCategoryColor}
                transitionDuration={this.state.transitionDuration}
                onSelect={this.props.methods.onSelect}
                dims={dims}
                features={this.props.features}
                setLoading={this.props.actions.setLoading}
                setNotLoading={this.props.actions.setNotLoading}
                eventRadius={this.props.ui.eventRadius}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  // Si del timeline se selecciona más de un evento, se borra el hash #. 
  //Si se selecciona un (1) evento, se agrega el hash #
  let comprobarHash = 0
  
  if (state.app.selected.length > 1 && comprobarHash == 0) {
    window.history.replaceState(null, "", " ")
    comprobarHash = 1 
  } else if (state.app.selected.length == 1 && comprobarHash == 1) {
    let id = `/#${state.app.selected[0]["id"]}`
    window.history.replaceState(null, "", id)
    comprobarHash = 2
  }


  return {
    dimensions: selectors.selectDimensions(state),
    domain: {
      events: selectors.selectStackedEvents(state),
      projects: selectors.selectProjects(state),
      categories: selectors.getCategories(state),
    },
    app: {
      selected: state.app.selected,
      language: state.app.language,
      timeline: state.app.timeline,
    },
    ui: {
      dom: state.ui.dom,
      styles: state.ui.style.selectedEvents,
      eventRadius: state.ui.eventRadius,
    },
    features: selectors.getFeatures(state),
  };

}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ setLoading, setNotLoading }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);