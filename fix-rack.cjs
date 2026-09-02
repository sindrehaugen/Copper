const fs = require('fs');
const file = 'app/src/views/rack/RackElevationView.tsx';
let code = fs.readFileSync(file, 'utf-8');
code = code.replace(/\{t\(\\'(.*)\\'\)\}/g, "{t('$1')}");
code = code.replace(/\{t\(\\'(.*?)\\',\s*(.*?)\)\}/g, "{t('$1', $2)}");
code = code.replace(/t\(\\'(.*?)\\'\)/g, "t('$1')");
code = code.replace(/t\(\\'(.*?)\\',\s*(.*?)\)/g, "t('$1', $2)");

// add const { t } = useTranslation();
code = code.replace(/const updateDocument = useDocumentStore\(s => s\.updateDocument\);/, "const { t } = useTranslation();\n  const updateDocument = useDocumentStore(s => s.updateDocument);");

fs.writeFileSync(file, code);
