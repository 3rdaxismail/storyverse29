import React from 'react';
import './CalendarHeatmap.css';

function CalendarHeatmap() {
  // 13 weeks x 7 days = 91 days of data
  // Colors represent activity intensity: empty, low, medium, high
  const heatmapData = [
    // Week 1 (Jan)
    [0, 0, 0, 0, 0, 0, 2],
    // Week 2
    [0, 1, 0, 0, 0, 0, 2],
    // Week 3
    [0, 0, 0, 0, 0, 0, 2],
    // Week 4
    [1, 0, 0, 1, 0, 0, 2],
    // Week 5 (Feb)
    [0, 2, 0, 1, 1, 0, 2],
    // Week 6
    [0, 0, 0, 0, 0, 0, 2],
    // Week 7
    [0, 0, 0, 0, 2, 0, 2],
    // Week 8
    [0, 0, 2, 0, 0, 0, 2],
    // Week 9
    [0, 0, 0, 0, 0, 0, 2],
    // Week 10 (Mar)
    [0, 0, 0, 0, 0, 0, 2],
    // Week 11
    [0, 0, 0, 0, 0, 0, 2],
    // Week 12
    [0, 0, 0, 0, 0, 0, 0],
    // Week 13
    [0, 0, 0, 0, 0, 0, 0],
  ];

  const monthLabels = ['Jan', 'Feb', 'Mar'];

  return (
    <div className="heatmap-content">
      {/* Month labels */}
      <div className="month-labels">
        {monthLabels.map((month, idx) => (
          <span key={idx} className="month-label">
            {month}
          </span>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="heatmap-grid">
        {heatmapData.map((week, weekIdx) => (
          <div key={weekIdx} className="heatmap-week">
            {week.map((intensity, dayIdx) => (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={`heatmap-day activity-${intensity}`}
                title={`Activity level: ${intensity}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarHeatmap;
