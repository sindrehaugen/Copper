const fs = require('fs');
const path = 'app/src/locales/en.json';
let data = JSON.parse(fs.readFileSync(path, 'utf-8'));
data.compliance = {
  title: 'Data Subject Access Request (DSAR) & Compliance',
  exportTitle: 'Request Your Data',
  exportButton: 'Request Data Export',
  exportPending: 'Request Pending',
  unavailable: 'Temporarily Unavailable (HS-13)',
  exportFailed: 'Export Failed',
  exportSuccess: 'Data Ready to Download',
  deleteTitle: 'Request Account Deletion',
  deleteButton: 'Request Deletion',
  deletePending: 'Request Pending',
  deleteFailed: 'Deletion Failed',
  deleteSuccess: 'Deletion Request Received',
  provenanceTitle: 'System Provenance',
  confirmTitle: 'Confirm Account Deletion',
  confirmAction: 'Erase all PII and design documents associated with this tenant.',
  confirmConfidence: 'High',
  confirmProvenance: 'GDPR Article 17 Right to Erasure.',
  aiSuggestion: 'AI Suggestion',
  proposedActionLabel: 'Proposed Action:',
  confidenceLabel: 'Confidence:',
  provenanceLabel: 'Why was this proposed?',
  humanOverride: 'Human Override - I am modifying this action',
  rejectBtn: 'Reject',
  confirmOverrideBtn: 'Confirm with Override',
  approveBtn: 'Approve AI Action',
  noRecords: 'No provenance records available.',
  actionLabel: 'Action:',
  originalLabel: 'Original',
  newLabel: 'New',
  citationLabel: 'Citation:'
};
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Added compliance keys to en.json');
