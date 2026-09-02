const fs = require('fs');

const files = [
  'app/src/shell/index.tsx',
  'app/src/views/canvas/nodes/LegendNode.tsx',
  'app/src/views/design/FloorplanMode.tsx',
  'app/src/views/palette/DevicePalette.tsx',
  'app/src/views/rack/RackElevationView.tsx',
  'app/src/views/scene/SceneView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf-8');
    // Replace \{t(\'something\')} with {t('something')}
    // Replace {t(\'...\')} with {t('...')}
    code = code.replace(/\{t\(\\'(.*?)\\'\)\}/g, "{t('$1')}");
    code = code.replace(/\{t\(\\'(.*?)\\',\s*(.*?)\)\}/g, "{t('$1', $2)}");
    code = code.replace(/t\(\\'(.*?)\\'\)/g, "t('$1')");
    code = code.replace(/t\(\\'(.*?)\\',\s*(.*?)\)/g, "t('$1', $2)");
    fs.writeFileSync(file, code);
  }
});

console.log('Fixed escaped quotes');
