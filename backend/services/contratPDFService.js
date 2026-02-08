const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

class ContratPDFService {
  constructor() {
    this.logoPath = path.join(__dirname, '../uploads/logos/logo-centre.png');
    this.outputDir = path.join(__dirname, '../uploads/contrats');
  }

  /**
   * Génère un contrat PDF avec le logo du centre
   * @param {Object} contrat - Données du contrat
   * @param {Object} employee - Données de l'employé
   * @param {Object} options - Options de génération
   * @returns {Promise<string>} - Chemin du fichier PDF généré
   */
  async generateContratPDF(contrat, employee, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Créer le nom du fichier
        const fileName = `contrat_${employee.nom_prenom.replace(/\s+/g, '_')}_${contrat.id}_${Date.now()}.pdf`;
        const outputPath = path.join(this.outputDir, fileName);

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

        // Créer le stream de sortie
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Ajouter le logo du centre
        await this.addLogo(doc);

        // Ajouter l'en-tête
        this.addHeader(doc, contrat, employee);

        // Ajouter le contenu du contrat
        this.addContratContent(doc, contrat, employee);

        // Ajouter les signatures
        this.addSignatures(doc);

        // Finaliser le document
        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Ajoute le logo du centre au document
   */
  async addLogo(doc) {
    try {
      if (await fs.pathExists(this.logoPath)) {
        doc.image(this.logoPath, 50, 50, {
          width: 100,
          height: 60
        });
      } else {
        // Logo par défaut élégant si le fichier n'existe pas
        this.createDefaultLogo(doc);
      }
    } catch (error) {
      console.warn('Impossible de charger le logo, utilisation du logo par défaut:', error.message);
      this.createDefaultLogo(doc);
    }
  }

  /**
   * Crée un logo par défaut élégant
   */
  createDefaultLogo(doc) {
    // Position du logo
    const x = 50;
    const y = 50;
    const width = 120;
    const height = 70;
    
    // Fond du logo avec dégradé simulé
    doc.rect(x, y, width, height)
       .fillColor('#3498db')
       .fill();
    
    // Bordure arrondie simulée
    doc.rect(x, y, width, height)
       .strokeColor('#2980b9')
       .lineWidth(2)
       .stroke();
    
    // Croix médicale
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Barre verticale de la croix
    doc.rect(centerX - 8, y + 15, 16, 40)
       .fillColor('white')
       .fill();
    
    // Barre horizontale de la croix
    doc.rect(x + 15, centerY - 8, 40, 16)
       .fillColor('white')
       .fill();
    
    // Texte du logo
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('white')
       .text('CENTRE', centerX, y + height - 20, { align: 'center' })
       .text('DE SANTÉ', centerX, y + height - 8, { align: 'center' });
  }

  /**
   * Ajoute l'en-tête du contrat
   */
  addHeader(doc, contrat, employee) {
    // Titre principal
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('CONTRAT DE TRAVAIL', { align: 'center' })
       .moveDown(0.5);

    // Informations du centre
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#34495e')
       .text('CENTRE DE SANTÉ INTÉGRÉ', { align: 'center' })
       .text('B.P. 123 - Libreville, Gabon', { align: 'center' })
       .text('Tél: +241 XX XX XX XX', { align: 'center' })
       .moveDown(1);

    // Ligne de séparation
    doc.moveTo(50, doc.y + 10)
       .lineTo(545, doc.y + 10)
       .strokeColor('#bdc3c7')
       .stroke()
       .moveDown(1);
  }

  /**
   * Ajoute le contenu principal du contrat
   */
  addContratContent(doc, contrat, employee) {
    // Informations de l'employé
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('INFORMATIONS DE L\'EMPLOYÉ')
       .moveDown(0.5);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#34495e');

    this.addInfoRow(doc, 'Nom et Prénom:', employee.nom_prenom);
    this.addInfoRow(doc, 'Matricule:', employee.matricule || 'N/A');
    this.addInfoRow(doc, 'Poste:', contrat.poste || 'À définir');
    this.addInfoRow(doc, 'Service:', contrat.service || 'À définir');
    this.addInfoRow(doc, 'Type de contrat:', contrat.type_contrat);
    this.addInfoRow(doc, 'Date de début:', this.formatDate(contrat.date_debut));
    
    if (contrat.date_fin) {
      this.addInfoRow(doc, 'Date de fin:', this.formatDate(contrat.date_fin));
    }

    if (contrat.salaire) {
      this.addInfoRow(doc, 'Salaire:', this.formatSalary(contrat.salaire));
    }

    doc.moveDown(1);

    // Conditions du contrat
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('CONDITIONS DU CONTRAT')
       .moveDown(0.5);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#34495e');

    const conditions = [
      '1. L\'employé s\'engage à respecter les horaires de travail établis par le centre.',
      '2. L\'employé doit respecter la confidentialité des informations médicales.',
      '3. L\'employé s\'engage à suivre les formations continues obligatoires.',
      '4. Le respect des règles d\'hygiène et de sécurité est obligatoire.',
      '5. Toute modification du contrat doit être approuvée par écrit.'
    ];

    conditions.forEach(condition => {
      doc.text(condition, { indent: 20 });
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
  }

  /**
   * Ajoute une ligne d'information
   */
  addInfoRow(doc, label, value) {
    const labelWidth = 120;
    const valueWidth = 300;
    
    doc.text(label, { width: labelWidth, continued: true })
       .text(value || 'Non spécifié', { width: valueWidth })
       .moveDown(0.3);
  }

  /**
   * Ajoute les sections de signature
   */
  addSignatures(doc) {
    doc.moveDown(2);

    // Ligne de séparation
    doc.moveTo(50, doc.y + 10)
       .lineTo(545, doc.y + 10)
       .strokeColor('#bdc3c7')
       .stroke()
       .moveDown(1);

    // Signatures
    const signatureY = doc.y + 20;
    
    // Signature de l'employé
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#34495e')
       .text('Signature de l\'employé:', 50, signatureY)
       .moveDown(2);

    doc.moveTo(50, doc.y)
       .lineTo(250, doc.y)
       .strokeColor('#95a5a6')
       .stroke()
       .moveDown(1);

    doc.text('Nom et date', { align: 'center', width: 200 });

    // Signature du responsable
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#34495e')
       .text('Signature du responsable:', 300, signatureY)
       .moveDown(2);

    doc.moveTo(300, doc.y)
       .lineTo(500, doc.y)
       .strokeColor('#95a5a6')
       .stroke()
       .moveDown(1);

    doc.text('Nom et date', { align: 'center', width: 200 });

    // Cachet du centre
    doc.moveDown(2);
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#7f8c8d')
       .text('Cachet du centre de santé', { align: 'center' });
  }

  /**
   * Formate une date
   */
  formatDate(dateString) {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formate un salaire
   */
  formatSalary(salary) {
    if (!salary) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(salary);
  }

  /**
   * Liste tous les contrats générés
   */
  async listGeneratedContrats() {
    try {
      const files = await fs.readdir(this.outputDir);
      const contrats = [];

      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          
          contrats.push({
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            url: `/uploads/contrats/${file}`
          });
        }
      }

      return contrats.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Erreur lors de la liste des contrats:', error);
      return [];
    }
  }

  /**
   * Supprime un contrat généré
   */
  async deleteGeneratedContrat(filename) {
    try {
      const filePath = path.join(this.outputDir, filename);
      await fs.remove(filePath);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }
}

module.exports = new ContratPDFService();
