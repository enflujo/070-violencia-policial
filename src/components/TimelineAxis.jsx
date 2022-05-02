import React from 'react';
import { select, axisBottom, timeFormat, transition } from 'd3';
// Toca importarlo para que funcione select().translation()
class TimelineAxis extends React.Component {
  constructor(props) {
    super(props);
    this.xAxis0Ref = React.createRef();
    this.xAxis1Ref = React.createRef();
    this.state = {
      isInitialized: false,
    };
  }

  componentDidUpdate() {
    let fstFmt, sndFmt;

    // 10yrs
    if (this.props.extent > 5256000) {
      fstFmt = '%Y';
      sndFmt = '';
      // 1yr
    } else if (this.props.extent > 43200) {
      sndFmt = '%Y';
      fstFmt = '%d %b';
    } else {
      sndFmt = '%d %b';
      fstFmt = '%H:%M';
    }

    if (this.props.scaleX) {
      this.x0 = axisBottom(this.props.scaleX)
        .ticks(10)
        .tickPadding(0)
        .tickSize(this.props.dims.trackHeight)
        .tickFormat(timeFormat(fstFmt));

      this.x1 = axisBottom(this.props.scaleX)
        .ticks(10)
        .tickPadding(this.props.dims.marginTop)
        .tickSize(0)
        .tickFormat(timeFormat(sndFmt));

      if (!this.state.isInitialized) this.setState({ isInitialized: true });
    }

    if (this.state.isInitialized) {
      select(this.xAxis0Ref.current).transition().duration(this.props.transitionDuration).call(this.x0);
      select(this.xAxis1Ref.current).transition().duration(this.props.transitionDuration).call(this.x1);
    }
  }

  render() {
    const PADDING = 20;

    return (
      <>
        <g ref={this.xAxis0Ref} transform={`translate(0, ${PADDING})`} clipPath="url(#clip)" className="axis xAxis" />
        <g
          ref={this.xAxis1Ref}
          transform={`translate(0, ${-PADDING / 2.5})`}
          clipPath="url(#clip)"
          className="axis xAxis"
        />
      </>
    );
  }
}

export default TimelineAxis;
