#!/usr/bin/env node
/**
 * Convertit les blocs COPY en instructions INSERT
 * Compatible avec le SQL Editor de Supabase
 * Ordre des tables respecte les contraintes de clés étrangères
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'rh_portail_DATA_ONLY.sql');
const outputFile = path.join(__dirname, '..', 'rh_portail_INSERT.sql');

// Ordre respectant les FK: employees avant contrats, employee_requests avant request_files, etc.
const TABLE_ORDER = [
  'public.absence', 'public.absences', 'public.conges',
  'public.effectif', 'public.employees',  // employees AVANT contrats
  'public.contrats', 'public.depart_history',
  'public.employee_documents', 'public.employee_notifications', 'public.employee_requests',
  'public.evenements', 'public.historique_departs', 'public.historique_recrutement',
  'public.hr_tasks', 'public.interviews', 'public.messages', 'public.notes',
  'public.offboarding_history', 'public.onboarding_history',
  'public.procedure_etapes', 'public.procedure_documents_requis', 'public.procedure_dossiers',
  'public.procedure_commentaires', 'public.procedure_documents_soumis',
  'public.procedure_notifications', 'public.procedure_statistiques',
  'public.recrutement_history', 'public.request_files',  // employee_requests avant request_files
  'public.sanctions_table', 'public.tasks', 'public.visites_medicales',
  'public.file_action_history', 'public.file_comments'
];

if (!fs.existsSync(inputFile)) {
  console.error('❌ Fichier rh_portail_DATA_ONLY.sql introuvable. Exécutez d\'abord: node scripts/extract-data-only.js');
  process.exit(1);
}

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

// Étape 1: Extraire les blocs par table
const tableBlocks = new Map();
let currentTable = null;
let currentColumns = null;
let inCopyBlock = false;

function parseCopyLine(line) {
  const match = line.match(/^COPY (public\.\w+)\s*\(([^)]+)\)\s+FROM stdin;?\s*$/);
  return match ? { table: match[1], columns: match[2].split(',').map(c => c.trim()) } : null;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const copyInfo = parseCopyLine(line);
  if (copyInfo) {
    inCopyBlock = true;
    currentTable = copyInfo.table;
    currentColumns = copyInfo.columns;
    tableBlocks.set(currentTable, { columns: currentColumns, rows: [] });
    continue;
  }
  if (inCopyBlock && line === '\\.') {
    inCopyBlock = false;
    currentTable = null;
    currentColumns = null;
    continue;
  }
  if (inCopyBlock && currentTable && currentColumns) {
    const values = line.split('\t');
    if (values.length === currentColumns.length) {
      tableBlocks.get(currentTable).rows.push(values);
    }
  }
}

// Étape 2: Générer les INSERT dans le bon ordre
function escapeValue(val) {
  if (val === '\\N' || val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

let output = [];
let insertCount = 0;

for (const table of TABLE_ORDER) {
  const block = tableBlocks.get(table);
  if (!block) continue;
  output.push(`\n-- Données pour ${table}`);
  for (const values of block.rows) {
    const escaped = values.map(v => escapeValue(v));
    output.push(`INSERT INTO ${table} (${block.columns.join(', ')}) VALUES (${escaped.join(', ')});`);
    insertCount++;
  }
}

// Tables non listées dans l'ordre (au cas où)
for (const [table, block] of tableBlocks) {
  if (!TABLE_ORDER.includes(table)) {
    output.push(`\n-- Données pour ${table}`);
    for (const values of block.rows) {
      const escaped = values.map(v => escapeValue(v));
      output.push(`INSERT INTO ${table} (${block.columns.join(', ')}) VALUES (${escaped.join(', ')});`);
      insertCount++;
    }
  }
}

fs.writeFileSync(outputFile, output.join('\n'), 'utf8');

console.log(`✅ Fichier créé: rh_portail_INSERT.sql`);
console.log(`   - ${tableBlocks.size} tables (ordre FK respecté)`);
console.log(`   - ${insertCount} lignes INSERT`);
console.log(`\nExécutez ce fichier dans le SQL Editor de Supabase.`);
