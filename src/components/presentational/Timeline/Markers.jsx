import React from 'react';
import colors from '../../../common/global';

const TimelineMarkers = ({
  styles,
  eventRadius,
  getEventX,
  getEventY,
  transitionDuration,
  selected,
  dims,
  features,
}) => {
  function renderMarker(event, idx) {
    function renderCircle() {
      return (
        <circle
          key={`timelineMarker-${idx}`}
          className="timeline-marker"
          cx={0}
          cy={0}
          stroke={styles ? styles.stroke : colors.primaryHighlight}
          strokeOpacity="1"
          strokeWidth={styles ? styles['stroke-width'] : 1}
          strokeLinejoin="round"
          strokeDasharray={styles ? styles['stroke-dasharray'] : '2,2'}
          style={{
            transform: `translate(${getEventX(event)}px, ${getEventY(event)}px)`,
            WebkitTransition: `transform ${transitionDuration / 1000}s ease`,
            MozTransition: 'none',
            opacity: 0.9,
          }}
          r={eventRadius * 2}
        />
      );
    }

    function renderBar() {
      return (
        <rect
          key={`timelineMarker-${idx}`}
          className="timeline-marker"
          x={0}
          y={0}
          width={eventRadius / 2}
          height={dims.contentHeight - 55}
          stroke={styles ? styles.stroke : colors.primaryHighlight}
          strokeOpacity="1"
          strokeWidth={styles ? styles['stroke-width'] : 1}
          strokeDasharray={styles ? styles['stroke-dasharray'] : '2,2'}
          style={{
            transform: `translate(${getEventX(event)}px)`,
            opacity: 0.7,
          }}
        />
      );
    }
    const isDot = (!!event.location && !!event.longitude) || (features.GRAPH_NONLOCATED && event.projectOffset !== -1);

    switch (event.shape) {
      case 'circle':
        return renderCircle();
      case 'bar':
        return renderBar();
      case 'diamond':
        return renderCircle();
      case 'star':
        return renderCircle();
      default:
        return isDot ? renderCircle() : renderBar();
    }
  }

  return <g>{selected.map((event, idx) => renderMarker(event, idx))}</g>;
};

export default TimelineMarkers;
