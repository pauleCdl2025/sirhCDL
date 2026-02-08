#!/usr/bin/env node
/**
 * Extrait le schéma SQL (sans les données COPY) pour Supabase.
 * L'éditeur SQL de Supabase ne supporte pas COPY ... FROM stdin.
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'rh_portail.sql');
const outputFile = path.join(__dirname, '..', 'rh_portail_supabase.sql');

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

let output = [];
let inCopyBlock = false;
let removedBlocks = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Détecter le début d'un bloc COPY
  if (line.match(/^COPY .+ FROM stdin;?\s*$/)) {
    inCopyBlock = true;
    removedBlocks++;
    continue;
  }
  
  // Détecter la fin d'un bloc COPY (\. seul sur une ligne)
  if (inCopyBlock && line === '\\.') {
    inCopyBlock = false;
    continue;
  }
  
  // Ignorer les lignes dans un bloc COPY
  if (inCopyBlock) {
    continue;
  }
  
  output.push(line);
}

const result = output.join('\n');
fs.writeFileSync(outputFile, result, 'utf8');

console.log(`✅ Fichier créé: rh_portail_supabase.sql`);
console.log(`   - ${removedBlocks} blocs COPY retirés`);
console.log(`   - Schéma uniquement (compatible Supabase SQL Editor)`);
console.log(`\nExécutez rh_portail_supabase.sql dans le SQL Editor de Supabase.`);
