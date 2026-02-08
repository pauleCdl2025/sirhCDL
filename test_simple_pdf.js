const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function testSimplePDF() {
  try {
    console.log('🧪 Test simple de génération PDF...');
    
    // Créer le nom du fichier
    const fileName = `test_simple_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, 'backend/uploads/contrats', fileName);
    
    console.log('📁 Fichier de sortie:', outputPath);
    
    // Créer le document PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    console.log('✅ Document PDF créé');
    
    // Créer le stream de sortie
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    
    console.log('✅ Stream de sortie créé');
    
    // Ajouter du contenu simple
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('TEST PDF SIMPLE', { align: 'center' })
       .moveDown(1);
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#34495e')
       .text('Ceci est un test de génération PDF', { align: 'center' });
    
    console.log('✅ Contenu ajouté au PDF');
    
    // Finaliser le document
    doc.end();
    
    console.log('✅ Document finalisé');
    
    // Attendre la fin de l'écriture
    stream.on('finish', () => {
      console.log('✅ PDF généré avec succès !');
      console.log('📁 Fichier créé:', outputPath);
      
      // Vérifier que le fichier existe
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`📊 Taille du fichier: ${stats.size} bytes`);
      }
    });
    
    stream.on('error', (error) => {
      console.error('❌ Erreur lors de l\'écriture:', error);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testSimplePDF();








