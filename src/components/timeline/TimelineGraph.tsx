import React, { useEffect, useRef, useState } from 'react';
import type { TimelineNode } from '../../firebase/services/timelineService';
import { getTensionColor } from '../../utils/tensionColorUtils';
import TimelineNodeComponent from './TimelineNodeComponent';
import styles from './TimelineGraph.module.css';

interface Chapter {
  id: string;
  title: string;
  actId?: string;
  tension?: number;
}

interface Act {
  actId: string;
  actTitle: string;
  actOrder: number;
}

interface TimelineGraphProps {
  nodes: TimelineNode[];
  chapters: Chapter[];
  acts: Act[];
  onNodePositionChange: (chapterId: string, x: number, y: number) => void;
  onTensionChange?: (chapterId: string, tension: number) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  isOwner: boolean;
}

const TimelineGraph: React.FC<TimelineGraphProps> = ({
  nodes,
  chapters,
  acts,
  onNodePositionChange,
  onTensionChange,
  selectedNodeId,
  onSelectNode,
  isOwner,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Update canvas dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw graph
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = 'rgba(20, 30, 45, 0.3)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const padding = { top: 40, bottom: 60, left: 60, right: 40 };
    const graphWidth = dimensions.width - padding.left - padding.right;
    const graphHeight = dimensions.height - padding.top - padding.bottom;

    // Draw axes
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, dimensions.height - padding.bottom);
    ctx.lineTo(dimensions.width - padding.right, dimensions.height - padding.bottom);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)';
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (graphWidth / 4) * i;
      const y = padding.top + (graphHeight / 4) * i;

      // Vertical grid
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, dimensions.height - padding.bottom);
      ctx.stroke();

      // Horizontal grid
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(dimensions.width - padding.right, y);
      ctx.stroke();
    }

    // Draw act divisions
    const actColors = [
      'rgba(52, 152, 219, 0.15)',
      'rgba(155, 89, 182, 0.15)',
      'rgba(46, 204, 113, 0.15)',
    ];
    
    // Calculate proportional act boundaries based on ACTUAL chapter counts per act using actId
    const actBoundaries: number[] = [0];
    
    if (acts.length > 0 && chapters.length > 0) {
      // Count chapters FOR EACH ACT by filtering on actId
      let cumulativeChapters = 0;
      
      acts.forEach((act) => {
        const actChapters = chapters.filter((ch: any) => ch.actId === act.actId);
        const actChapterCount = actChapters.length;
        cumulativeChapters += actChapterCount;
        
        // Calculate this act's end boundary as proportion of total chapters
        const boundary = cumulativeChapters / chapters.length;
        actBoundaries.push(Math.min(1, boundary));
      });
      
      // Ensure last boundary is exactly 1
      actBoundaries[actBoundaries.length - 1] = 1;
    } else {
      // Fallback to equal division
      actBoundaries.push(0.33, 0.67, 1);
    }
    
    const actLabels = acts.length > 0 ? acts.map(act => act.actTitle) : ['Act 1', 'Act 2', 'Act 3'];

    for (let i = 0; i < actBoundaries.length - 1; i++) {
      const x1 = padding.left + actBoundaries[i] * graphWidth;
      const x2 = padding.left + actBoundaries[i + 1] * graphWidth;

      // Draw act background
      ctx.fillStyle = actColors[i % actColors.length];
      ctx.fillRect(x1, padding.top, x2 - x1, graphHeight);

      // Draw act label
      if (i < actLabels.length) {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        const labelX = x1 + (x2 - x1) / 2;
        ctx.fillText(actLabels[i], labelX, padding.top - 15);
      }
    }

    // Draw smooth curve connecting nodes using TENSION VALUES with gradient colors
    if (nodes.length > 0) {
      const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);

      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw line segments with individual colors based on tension
      sortedNodes.forEach((node, index) => {
        if (index === 0) return; // Skip first point, draw from second onwards

        const chapter = chapters.find((ch) => ch.id === node.chapterId);
        const prevChapter = chapters.find((ch) => ch.id === sortedNodes[index - 1].chapterId);
        
        const tension = (chapter?.tension ?? 0);
        const prevTension = (prevChapter?.tension ?? 0);
        
        // Get color based on current tension
        const color = getTensionColor(tension);
        ctx.strokeStyle = color;
        
        // Current point
        const x = padding.left + node.x * graphWidth;
        const y = dimensions.height - padding.bottom - (tension / 100) * graphHeight;
        
        // Previous point
        const prevNode = sortedNodes[index - 1];
        const prevX = padding.left + prevNode.x * graphWidth;
        const prevY = dimensions.height - padding.bottom - (prevTension / 100) * graphHeight;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      });
    }

    // Draw axis labels
    ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time Progression →', dimensions.width / 2, dimensions.height - 20);

    ctx.save();
    ctx.translate(20, dimensions.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Tension ↑', 0, 0);
    ctx.restore();
  }, [nodes, dimensions, acts, chapters]);

  const getPixelCoordinates = (node: TimelineNode): { x: number; y: number } => {
    const padding = { top: 40, bottom: 60, left: 60, right: 40 };
    const graphWidth = dimensions.width - padding.left - padding.right;
    const graphHeight = dimensions.height - padding.top - padding.bottom;

    return {
      x: padding.left + node.x * graphWidth,
      y: dimensions.height - padding.bottom - node.y * graphHeight,
    };
  };

  const getNodeCoordinates = (pixelX: number, pixelY: number): { x: number; y: number } => {
    const padding = { top: 40, bottom: 60, left: 60, right: 40 };
    const graphWidth = dimensions.width - padding.left - padding.right;
    const graphHeight = dimensions.height - padding.top - padding.bottom;

    const x = Math.max(0, Math.min(1, (pixelX - padding.left) / graphWidth));
    const y = Math.max(0, Math.min(1, (dimensions.height - padding.bottom - pixelY) / graphHeight));

    return { x, y };
  };

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (!isOwner || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.chapterId === nodeId);
    if (!node) return;

    const nodePixels = getPixelCoordinates(node);
    setDragOffset({
      x: e.clientX - rect.left - nodePixels.x,
      y: e.clientY - rect.top - nodePixels.y,
    });
    setDraggedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNodeId || !containerRef.current || !isOwner) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pixelY = e.clientY - rect.top - dragOffset.y;

    const node = nodes.find((n) => n.chapterId === draggedNodeId);
    if (!node) return;

    // Lock X-axis movement - only allow Y-axis (vertical) changes
    const padding = { top: 40, bottom: 60, left: 60, right: 40 };
    const graphHeight = dimensions.height - padding.top - padding.bottom;
    const y = Math.max(0, Math.min(1, (dimensions.height - padding.bottom - pixelY) / graphHeight));

    // Keep original X position, only change Y
    onNodePositionChange(draggedNodeId, node.x, y);
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  useEffect(() => {
    if (draggedNodeId) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNodeId, dragOffset]);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Render chapter node components */}
      {nodes.map((node) => {
        const chapter = chapters.find((c) => c.id === node.chapterId);
        const tension = chapter?.tension ?? 0;
        // Calculate pixel coordinates using tension value
        const padding = { top: 40, bottom: 60, left: 60, right: 40 };
        const graphWidth = dimensions.width - padding.left - padding.right;
        const graphHeight = dimensions.height - padding.top - padding.bottom;
        const pixelCoords = {
          x: padding.left + node.x * graphWidth,
          y: dimensions.height - padding.bottom - (tension / 100) * graphHeight,
        };

        return (
          <TimelineNodeComponent
            key={node.chapterId}
            node={node}
            chapter={chapter}
            pixelCoords={pixelCoords}
            isSelected={selectedNodeId === node.chapterId}
            isOwner={isOwner}
            onSelect={() => onSelectNode(node.chapterId)}
            onTensionClick={() => {
              // Select the node to open right panel instead of popup
              onSelectNode(node.chapterId);
            }}
            onMouseDown={(e) => handleMouseDown(node.chapterId, e)}
          />
        );
      })}

      {/* Tension controls shown in right panel instead of popup */}
    </div>
  );
};

export default TimelineGraph;
