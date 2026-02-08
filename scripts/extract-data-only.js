#!/usr/bin/env node
/**
 * Extrait uniquement les données (blocs COPY) de rh_portail.sql
 * Pour importer dans des tables Supabase déjà créées.
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'rh_portail.sql');
const outputFile = path.join(__dirname, '..', 'rh_portail_DATA_ONLY.sql');

if (!fs.existsSync(inputFile)) {
  console.error('❌ Fichier rh_portail.sql introuvable');
  process.exit(1);
}

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

let output = [];
let inCopyBlock = false;
let copyBlocks = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Détecter le début d'un bloc COPY
  if (line.match(/^COPY .+ FROM stdin;?\s*$/)) {
    inCopyBlock = true;
    copyBlocks++;
    output.push(line);
    continue;
  }
  
  // Dans un bloc COPY : garder les lignes de données et le \.
  if (inCopyBlock) {
    output.push(line);
    if (line === '\\.') {
      inCopyBlock = false;
    }
    continue;
  }
}

const result = output.join('\n');
fs.writeFileSync(outputFile, result, 'utf8');

console.log(`✅ Fichier créé: rh_portail_DATA_ONLY.sql`);
console.log(`   - ${copyBlocks} blocs COPY extraits`);
console.log(`   - Données uniquement (tables doivent déjà exister)`);
console.log(`\nImport avec: node scripts/import-data-to-supabase.js`);
console.log(`(Utilisez le fichier rh_portail_DATA_ONLY.sql au lieu de rh_portail.sql)`);
