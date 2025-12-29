import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Utility to access and query Figma layer groups
 */
class FigmaLayerAccessor {
  constructor() {
    this.layers = this.loadLayers();
  }

  /**
   * Load layers from the exported JSON file
   */
  loadLayers() {
    const filePath = path.join(__dirname, 'figma-layers-export.json');
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading layers:', error.message);
      return [];
    }
  }

  /**
   * Find a layer by name (case-insensitive)
   */
  findByName(name) {
    return this.layers.find(
      (layer) => layer.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Find all layers matching a pattern
   */
  findByPattern(pattern) {
    const regex = new RegExp(pattern, 'i');
    return this.layers.filter((layer) => regex.test(layer.name));
  }

  /**
   * Find all groups of a specific type
   */
  findByType(type) {
    return this.layers.filter((layer) => layer.type === type);
  }

  /**
   * Get group hierarchy (parent-child relationships)
   */
  getGroupHierarchy(groupName) {
    const group = this.findByName(groupName);
    if (!group) {
      return null;
    }
    return {
      name: group.name,
      type: group.type,
      id: group.id,
      depth: group.depth,
      children: group.children || [],
      bounds: group.bounds || null,
    };
  }

  /**
   * Get all children of a specific group
   */
  getGroupChildren(groupName) {
    const group = this.getGroupHierarchy(groupName);
    if (!group || !group.children) {
      return [];
    }
    return group.children;
  }

  /**
   * List all GROUP type elements
   */
  getAllGroups() {
    return this.findByType('GROUP');
  }

  /**
   * Get statistics about layers
   */
  getStatistics() {
    const byType = {};
    this.layers.forEach((layer) => {
      byType[layer.type] = (byType[layer.type] || 0) + 1;
    });

    return {
      totalLayers: this.layers.length,
      byType,
      groups: this.getAllGroups().length,
      frames: this.findByType('FRAME').length,
      vectors: this.findByType('VECTOR').length,
      text: this.findByType('TEXT').length,
    };
  }

  /**
   * Get detailed info about group-header-actions
   */
  getHeaderActionsGroup() {
    return this.getGroupHierarchy('group-header-actions');
  }

  /**
   * Export layer data as JSON
   */
  exportAsJson(outputPath) {
    const data = {
      totalLayers: this.layers.length,
      generatedAt: new Date().toISOString(),
      layers: this.layers,
    };
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✅ Exported to: ${outputPath}`);
  }

  /**
   * Print layer hierarchy in tree format
   */
  printHierarchy(groupName, depth = 0) {
    const group = this.getGroupHierarchy(groupName);
    if (!group) {
      console.log(`Group "${groupName}" not found`);
      return;
    }

    const indent = '  '.repeat(depth);
    const icon =
      group.type === 'GROUP'
        ? '📁'
        : group.type === 'FRAME'
          ? '📦'
          : '📄';

    console.log(`${indent}${icon} ${group.name} (${group.type})`);

    if (group.children && group.children.length > 0) {
      group.children.forEach((child) => {
        const childIndent = '  '.repeat(depth + 1);
        const childIcon = child.type === 'GROUP' ? '📁' : '📄';
        console.log(
          `${childIndent}${childIcon} ${child.name} (${child.type})`
        );
      });
    }
  }
}

// Export the class
export default FigmaLayerAccessor;

// CLI usage
if (process.argv[1] === __filename) {
  const accessor = new FigmaLayerAccessor();

  const command = process.argv[2];

  switch (command) {
    case 'stats':
      console.log('\n📊 Layer Statistics:\n');
      const stats = accessor.getStatistics();
      console.log(JSON.stringify(stats, null, 2));
      break;

    case 'header':
      console.log('\n📋 Header Actions Group:\n');
      const header = accessor.getHeaderActionsGroup();
      console.log(JSON.stringify(header, null, 2));
      break;

    case 'groups':
      console.log('\n📁 All Groups:\n');
      const groups = accessor.getAllGroups();
      groups.forEach((group, i) => {
        console.log(`${i + 1}. ${group.name} (${group.children?.length || 0} children)`);
      });
      break;

    case 'tree':
      const groupName = process.argv[3] || 'group-header-actions';
      console.log(`\n🌳 Hierarchy for "${groupName}":\n`);
      accessor.printHierarchy(groupName);
      break;

    case 'find':
      const pattern = process.argv[3];
      if (!pattern) {
        console.log('Usage: node figmaLayerAccessor.mjs find <pattern>');
        break;
      }
      console.log(`\n🔍 Searching for pattern: "${pattern}"\n`);
      const results = accessor.findByPattern(pattern);
      results.forEach((layer, i) => {
        console.log(`${i + 1}. ${layer.name} (${layer.type})`);
      });
      break;

    default:
      console.log(`
🎯 Figma Layer Accessor - Usage:
  
  Commands:
    stats          - Show layer statistics
    header         - Show group-header-actions details
    groups         - List all groups
    tree <name>    - Show hierarchy for a group
    find <pattern> - Find layers matching pattern
  
  Examples:
    node figmaLayerAccessor.mjs stats
    node figmaLayerAccessor.mjs header
    node figmaLayerAccessor.mjs tree group-header-actions
    node figmaLayerAccessor.mjs find "icon"
      `);
  }
}
