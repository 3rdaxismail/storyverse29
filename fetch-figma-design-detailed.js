const fileKey = 'ANcQmXcFFJNmLJQR5UOanT';
const token = 'figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD';

async function fetchFigmaDesign() {
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: { 'X-FIGMA-TOKEN': token }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Get the first page
    const page = data.document.children[0];
    
    console.log(JSON.stringify({
      fileName: data.name,
      page: {
        name: page.name,
        id: page.id,
        frames: page.children.map(child => ({
          name: child.name,
          id: child.id,
          type: child.type,
          x: child.x,
          y: child.y,
          width: child.width,
          height: child.height,
          children: child.children ? child.children.map(c => ({
            name: c.name,
            type: c.type,
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height,
            fills: c.fills,
            strokes: c.strokes,
            strokeWeight: c.strokeWeight,
            cornerRadius: c.cornerRadius,
            text: c.characters,
            style: c.style,
            fontSize: c.fontSize,
            fontFamily: c.fontFamily,
            fontWeight: c.fontWeight,
            textAlignHorizontal: c.textAlignHorizontal,
            textAlignVertical: c.textAlignVertical,
            letterSpacing: c.letterSpacing,
            lineHeightPx: c.lineHeightPx,
            opacity: c.opacity,
            effects: c.effects,
            constraints: c.constraints,
            rotation: c.rotation,
          })) : [],
          fills: child.fills,
          strokes: child.strokes,
          effects: child.effects,
        }))
      },
      colors: data.styles ? Object.values(data.styles).filter(s => s.styleType === 'FILL').slice(0, 20) : [],
    }, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchFigmaDesign();
