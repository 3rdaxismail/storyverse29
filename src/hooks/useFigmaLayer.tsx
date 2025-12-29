import { useState, useEffect } from 'react';

/**
 * React hook to access Figma layer data
 * @param {string} groupName - Name of the group to fetch
 * @returns {Object} Layer data and helper methods
 */
export function useFigmaLayer(groupName) {
  const [layerData, setLayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLayerData = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from your API or static data
        const response = await fetch('/figma-layers-export.json');
        if (!response.ok) throw new Error('Failed to load layer data');
        
        const allLayers = await response.json();
        const layer = allLayers.find(
          (l) => l.name.toLowerCase() === groupName.toLowerCase()
        );
        
        setLayerData(layer);
        setError(null);
      } catch (err) {
        setError(err.message);
        setLayerData(null);
      } finally {
        setLoading(false);
      }
    };

    loadLayerData();
  }, [groupName]);

  return {
    data: layerData,
    loading,
    error,
    children: layerData?.children || [],
    bounds: layerData?.bounds || null,
    id: layerData?.id || null,
    type: layerData?.type || null,
  };
}

/**
 * Hook to get all layer groups matching a pattern
 */
export function useFigmaLayersPattern(pattern) {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLayers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/figma-layers-export.json');
        if (!response.ok) throw new Error('Failed to load layer data');
        
        const allLayers = await response.json();
        const regex = new RegExp(pattern, 'i');
        const filtered = allLayers.filter((layer) =>
          regex.test(layer.name)
        );
        
        setLayers(filtered);
        setError(null);
      } catch (err) {
        setError(err.message);
        setLayers([]);
      } finally {
        setLoading(false);
      }
    };

    loadLayers();
  }, [pattern]);

  return { layers, loading, error };
}

/**
 * Hook to get layer statistics
 */
export function useFigmaLayerStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/figma-layers-export.json');
        if (!response.ok) throw new Error('Failed to load layer data');
        
        const allLayers = await response.json();
        const byType = {};
        
        allLayers.forEach((layer) => {
          byType[layer.type] = (byType[layer.type] || 0) + 1;
        });

        setStats({
          totalLayers: allLayers.length,
          byType,
          groups: allLayers.filter((l) => l.type === 'GROUP').length,
          frames: allLayers.filter((l) => l.type === 'FRAME').length,
          vectors: allLayers.filter((l) => l.type === 'VECTOR').length,
          text: allLayers.filter((l) => l.type === 'TEXT').length,
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading, error };
}

/**
 * Component to display layer information
 */
export function FigmaLayerViewer({ groupName }) {
  const { data, loading, error, children, bounds } = useFigmaLayer(groupName);

  if (loading) return <div className="loading">Loading layer data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return <div className="not-found">Layer not found</div>;

  return (
    <div className="figma-layer-viewer">
      <h3>{data.name}</h3>
      <div className="layer-details">
        <p>
          <strong>Type:</strong> {data.type}
        </p>
        <p>
          <strong>ID:</strong> {data.id}
        </p>
        {bounds && (
          <div className="bounds">
            <strong>Bounds:</strong>
            <ul>
              <li>X: {bounds.x}</li>
              <li>Y: {bounds.y}</li>
              <li>Width: {bounds.width}</li>
              <li>Height: {bounds.height}</li>
            </ul>
          </div>
        )}
        {children.length > 0 && (
          <div className="children">
            <strong>Children ({children.length}):</strong>
            <ul>
              {children.map((child) => (
                <li key={child.id}>
                  {child.name} ({child.type})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Component to search and display layers
 */
export function FigmaLayerSearch() {
  const [search, setSearch] = useState('icon');
  const { layers, loading, error } = useFigmaLayersPattern(search);

  return (
    <div className="figma-layer-search">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search layers..."
        className="search-input"
      />
      
      {loading && <p>Searching...</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="results">
        <h4>Results ({layers.length}):</h4>
        <ul>
          {layers.map((layer) => (
            <li key={layer.id}>
              <strong>{layer.name}</strong>
              <span className="type">{layer.type}</span>
              {layer.bounds && (
                <span className="bounds">
                  [{layer.bounds.x}, {layer.bounds.y}]
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Component to display layer statistics
 */
export function FigmaLayerStats() {
  const { stats, loading, error } = useFigmaLayerStats();

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="figma-layer-stats">
      <h3>Layer Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-value">{stats.totalLayers}</p>
          <p className="stat-label">Total Layers</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{stats.frames}</p>
          <p className="stat-label">Frames</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{stats.groups}</p>
          <p className="stat-label">Groups</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{stats.vectors}</p>
          <p className="stat-label">Vectors</p>
        </div>
      </div>
      
      <h4>By Type:</h4>
      <ul>
        {Object.entries(stats.byType).map(([type, count]) => (
          <li key={type}>
            {type}: {count}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default {
  useFigmaLayer,
  useFigmaLayersPattern,
  useFigmaLayerStats,
  FigmaLayerViewer,
  FigmaLayerSearch,
  FigmaLayerStats,
};
