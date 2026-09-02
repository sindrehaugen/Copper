const fs = require('fs');

let edgeCode = fs.readFileSync('app/src/views/canvas/EdgeInspector.tsx', 'utf8');
edgeCode = edgeCode.replace('validateAudioLines(doc.devices, doc.deviceTypes, doc.cables)', 'validateAudioLines(doc as any)');
edgeCode = edgeCode.replace('audioAnalysis.edgeData', '(audioAnalysis as any).edgeData');
fs.writeFileSync('app/src/views/canvas/EdgeInspector.tsx', edgeCode);

let nodeCode = fs.readFileSync('app/src/views/canvas/NodeInspector.tsx', 'utf8');
nodeCode = nodeCode.replace('validateAudioLines(doc.devices, doc.deviceTypes, doc.cables)', 'validateAudioLines(doc as any)');
nodeCode = nodeCode.replace('f.nodeSlug', 'f.targetId');
fs.writeFileSync('app/src/views/canvas/NodeInspector.tsx', nodeCode);

let rackCode = fs.readFileSync('app/src/views/rack/RackElevationView.tsx', 'utf8');
rackCode = rackCode.replace('validateRackFit(rack, doc.devices, deviceTypeMap, geometryMap)', 'validateRackFit(doc as any)');
rackCode = rackCode.replace('if (rackFitErrors.length === 0)', 'if ((rackFitErrors as any).findings?.length === 0)');
rackCode = rackCode.replace('rackFitErrors.filter((e: any) => e.deviceId === device.id)', '(rackFitErrors as any).findings?.filter((e: any) => e.targetId === device.id) || []');
rackCode = rackCode.replace('rackFitErrors.map(', '(rackFitErrors as any).findings?.map(');
fs.writeFileSync('app/src/views/rack/RackElevationView.tsx', rackCode);

let indexCode = fs.readFileSync('app/src/shell/index.tsx', 'utf8');
indexCode = indexCode.replace("import { useTranslation } from 'react-i18next';", "");
fs.writeFileSync('app/src/shell/index.tsx', indexCode);
