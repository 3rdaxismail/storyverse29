const fileKey = 'ANcQmXcFFJNmLJQR5UOanT';
const token = 'figd_Ysyof8cLgVIm2kgnoWyvd_pJzeR0vv6T-YsYvUHD';

fetch(`https://api.figma.com/v1/files/${fileKey}`, {
  headers: { 'X-FIGMA-TOKEN': token }
})
  .then(r => r.json())
  .then(data => {
    console.log('\n📋 FIGMA FILE INFORMATION\n');
    console.log(`📄 File Name: ${data.name}`);
    console.log(`\n📑 Pages (${data.document.children.length}):`);
    data.document.children.forEach((page, i) => {
      console.log(`   ${i + 1}. ${page.name}`);
    });
    
    console.log(`\n🔧 Components (${Object.keys(data.components || {}).length}):`);
    Object.values(data.components || {}).slice(0, 10).forEach(comp => {
      console.log(`   - ${comp.name}`);
    });
    
    console.log(`\n📊 File Stats:`);
    console.log(`   - Last Modified: ${new Date(data.lastModified).toLocaleDateString()}`);
    console.log(`   - Version: ${data.version}`);
  })
  .catch(err => console.error('Error:', err.message));
