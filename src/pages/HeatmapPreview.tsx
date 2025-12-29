import React from 'react';
import CalendarHeatmap from '@/components/ui/CalendarHeatmap';

function HeatmapPreview() {
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgb(13, 13, 15) 0%, rgb(30, 30, 35) 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <h1 style={{
        color: 'white',
        marginBottom: '40px',
        fontSize: '32px',
        fontWeight: 600,
      }}>
        Calendar Heatmap
      </h1>
      <CalendarHeatmap />
    </div>
  );
}

export default HeatmapPreview;
