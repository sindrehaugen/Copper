const fs = require('fs');
const path = 'app/src/locales/nb-NO.json';
let data = JSON.parse(fs.readFileSync(path, 'utf-8'));
data.compliance = {
  title: 'Innsynskrav og Samsvar (DSAR)',
  exportTitle: 'Be om Dine Data',
  exportButton: 'Be om Dataeksport',
  exportPending: 'Forespørsel Behandles',
  unavailable: 'Midlertidig Utilgjengelig (HS-13)',
  exportFailed: 'Eksport Feilet',
  exportSuccess: 'Data Klar for Nedlasting',
  deleteTitle: 'Be om Kontosletting',
  deleteButton: 'Be om Sletting',
  deletePending: 'Forespørsel Behandles',
  deleteFailed: 'Sletting Feilet',
  deleteSuccess: 'Sletteforespørsel Mottatt',
  provenanceTitle: 'Systemproveniens',
  confirmTitle: 'Bekreft Kontosletting',
  confirmAction: 'Slett all PII og designdokumenter knyttet til denne leietakeren.',
  confirmConfidence: 'Høy',
  confirmProvenance: 'GDPR Artikkel 17 Rett til Sletting.',
  aiSuggestion: 'AI-forslag',
  proposedActionLabel: 'Foreslått Handling:',
  confidenceLabel: 'Konfidens:',
  provenanceLabel: 'Hvorfor ble dette foreslått?',
  humanOverride: 'Manuell Overstyring - Jeg endrer denne handlingen',
  rejectBtn: 'Avvis',
  confirmOverrideBtn: 'Bekreft med Overstyring',
  approveBtn: 'Godkjenn AI-handling',
  noRecords: 'Ingen proveniensposter tilgjengelig.',
  actionLabel: 'Handling:',
  originalLabel: 'Opprinnelig',
  newLabel: 'Ny',
  citationLabel: 'Henvisning:'
};
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Added compliance keys to nb-NO.json');
