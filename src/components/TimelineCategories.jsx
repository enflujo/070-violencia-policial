import React, { Component, createRef, Fragment } from 'react';
import { select, drag } from 'd3';

class TimelineCategories extends Component {
  constructor(props) {
    super(props);
    this.grabRef = createRef();
    this.state = {
      isInitialized: false,
    };
  }

  componentDidUpdate() {
    if (!this.state.isInitialized) {
      const dragEvents = drag()
        .on('start', this.props.onDragStart)
        .on('drag', this.props.onDrag)
        .on('end', this.props.onDragEnd);

      select(this.grabRef.current).call(dragEvents);

      this.setState({ isInitialized: true });
    }
  }

  renderCategory(cat, idx) {
    const { dims } = this.props;
    const { category } = cat;
    const strokeWidth = 1; // dims.trackHeight / (this.props.categories.length + 1)
    const categoriaY = this.props.getCategoryY(category);
    if (!categoriaY) return;

    return (
      <Fragment key={`category-${idx}`}>
        <g className="tick" style={{ strokeWidth }} opacity="0.5" transform={`translate(0,${categoriaY})`}>
          <line x1={dims.marginLeft + 150} x2={dims.width - dims.width_controls} />
        </g>
        <g className="tick" opacity="1" transform={`translate(0,${categoriaY})`}>
          <text x={dims.marginLeft - 5} dy="0.32em" fill="#f5f5f5">
            {category}
          </text>
        </g>
      </Fragment>
    );
  }

  render() {
    const { dims } = this.props;
    // Needed to fix render error, probably fired too early in the lifecycle where dims are not set.
    if (dims.width === 0) return '';
    const categories = this.props.features.USE_CATEGORIES
      ? this.props.categories.map((cat, idx) => this.renderCategory(cat, idx))
      : this.renderCategory('Events', 0);

    return <g className="yAxis">{categories}</g>;
  }
}

export default TimelineCategories;
