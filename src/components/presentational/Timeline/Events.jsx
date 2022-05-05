import React from 'react';
import DatetimeBar from './DatetimeBar.jsx';
import Project from './Project.jsx';
import { calcOpacity } from '../../../common/utilities';

function renderDot(event, styles, props, idx) {
  return (
    <circle
      key={`eventDot-${idx}`}
      onClick={props.onSelect}
      className="event"
      cx={props.x}
      cy={props.y}
      style={styles}
      r={props.eventRadius}
    />
  );
}

function renderBar(event, styles, props, idx) {
  const fillOpacity = props.features.GRAPH_NONLOCATED
    ? event.projectOffset >= 0
      ? styles.opacity
      : 0.5
    : calcOpacity(1);

  return (
    <DatetimeBar
      key={idx}
      onSelect={props.onSelect}
      category={event.category}
      events={[event]}
      x={props.x}
      y={props.dims.marginTop}
      width={props.eventRadius / 4}
      height={props.dims.trackHeight}
      styleProps={{ ...styles, fillOpacity }}
      highlights={props.highlights}
    />
  );
}

function renderDiamond(event, styles, props, idx) {
  const r = 1.8 * props.eventRadius;
  return (
    <rect
      key={`dateTimeSquare-${idx}`}
      onSelect={props.onSelect}
      className="event"
      x={props.x}
      y={props.y - r}
      style={styleProps}
      width={r}
      height={r}
      transform={`rotate(45, ${props.x}, ${props.y})`}
    />
  );
}

function renderStar(event, styles, props, idx) {
  return (
    <polygon
      key={`dateTimeStar-${idx}`}
      onClick={props.onSelect}
      className="event"
      x={props.x}
      y={props.y - 1.8 * props.eventRadius}
      style={{ ...styles, fillRule: 'nonzero' }}
      points={`${x},${y + s} ${x - s},${y - s} ${x + s},${y} ${x - s},${y} ${x + s},${y - s}`}
      transform="rotate(90)"
    />
  );
}

const TimelineEvents = ({
  events,
  getDatetimeX,
  getY,
  getCategoryColor,
  getHighlights,
  onSelect,
  transitionDuration,
  dims,
  features,
  eventRadius,
}) => {
  function renderEvent(event, idx) {
    const isDot = (!!event.location && !!event.longitude) || (features.GRAPH_NONLOCATED && event.projectOffset !== -1);
    let renderShape = isDot ? renderDot : renderBar;

    if (event.shape) {
      if (event.shape === 'bar') {
        renderShape = renderBar;
      } else if (event.shape === 'diamond') {
        renderShape = renderDiamond;
      } else if (event.shape === 'star') {
        renderShape = renderStar;
      } else {
        renderShape = renderDot;
      }
    }

    const eventY = getY(event);
    const colour = event.colour ? event.colour : getCategoryColor(event.category);

    const styles = {
      fill: colour,
      fillOpacity: eventY > 0 ? calcOpacity(1) : 0,
      transition: `transform ${transitionDuration / 1000}s ease`,
    };

    return renderShape(
      event,
      styles,
      {
        x: getDatetimeX(event.datetime),
        y: eventY,
        eventRadius,
        onSelect: () => onSelect(event),
        dims,
        highlights: features.HIGHLIGHT_GROUPS
          ? getHighlights(event.filters[features.HIGHLIGHT_GROUPS.filterIndexIndicatingGroup])
          : [],
        features,
      },
      idx
    );
  }

  return <g>{events.map((event, idx) => renderEvent(event, idx))}</g>;
};

export default TimelineEvents;
