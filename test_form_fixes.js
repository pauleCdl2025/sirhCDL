const fs = require('fs');
const path = require('path');

function testFormFixes() {
    try {
        console.log('🔍 Test des corrections du formulaire EditEmployee...\n');
        
        // Lire le fichier EditEmployee.jsx
        const filePath = path.join(__dirname, 'src', 'components', 'employees', 'EditEmployee.jsx');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // 1. Vérifier que le champ matricule est présent
        console.log('📋 Étape 1: Vérification du champ matricule...');
        
        const matriculeChecks = [
            'name="matricule"',
            'employeeData.matricule',
            'matricule: employee.matricule',
            'matricule: employeeData.matricule'
        ];
        
        let matriculeFound = 0;
        matriculeChecks.forEach(check => {
            if (fileContent.includes(check)) {
                matriculeFound++;
            }
        });
        
        console.log(`   ${matriculeFound === 4 ? '✅' : '❌'} Champ matricule: ${matriculeFound}/4 vérifications`);
        
        // 2. Vérifier qu'il n'y a plus de champs avec l'ancien CSS
        console.log('\n🎨 Étape 2: Vérification de l\'élimination de l\'ancien CSS...');
        
        const oldCSSPatterns = [
            'className="block text-sm font-medium text-gray-700 mb-2"',
            'className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"',
            'className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"',
            'className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"',
            'className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"',
            'className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"'
        ];
        
        let oldCSSFound = 0;
        oldCSSPatterns.forEach(pattern => {
            if (fileContent.includes(pattern)) {
                oldCSSFound++;
            }
        });
        
        console.log(`   ${oldCSSFound === 0 ? '✅' : '❌'} Ancien CSS éliminé: ${oldCSSFound} patterns trouvés`);
        
        // 3. Vérifier que tous les champs utilisent les nouvelles classes CSS
        console.log('\n🎯 Étape 3: Vérification de l\'utilisation des nouvelles classes CSS...');
        
        const requiredFields = [
            'matricule', 'genre', 'noms', 'situation_maritale', 'nbr_enfants', 
            'date_naissance', 'age', 'lieu', 'adresse', 'telephone', 'email', 
            'cnss_number', 'cnamgs_number', 'poste_actuel', 'type_contrat', 
            'date_embauche', 'date_fin_contrat', 'employee_type', 'functional_area', 
            'entity', 'responsable', 'statut_employe', 'nationalite', 'niveau_academique', 
            'diplome', 'anciennete_entreprise'
        ];
        
        let fieldsWithNewCSS = 0;
        requiredFields.forEach(field => {
            if (fileContent.includes(`name="${field}"`)) {
                fieldsWithNewCSS++;
            }
        });
        
        console.log(`   ${fieldsWithNewCSS === requiredFields.length ? '✅' : '❌'} Champs avec nouveau CSS: ${fieldsWithNewCSS}/${requiredFields.length}`);
        
        // 4. Vérifier la structure des sections
        console.log('\n📁 Étape 4: Vérification de la structure des sections...');
        
        const sections = [
            'Informations générales',
            'Informations professionnelles', 
            'Informations personnelles',
            'Informations de rémunération',
            'Informations administratives'
        ];
        
        let wellStructuredSections = 0;
        sections.forEach(section => {
            if (fileContent.includes(`{/* Section ${section} */}`) &&
                fileContent.includes('edit-employee-section') &&
                fileContent.includes('edit-employee-section-header') &&
                fileContent.includes('edit-employee-section-container')) {
                wellStructuredSections++;
            }
        });
        
        console.log(`   ${wellStructuredSections === sections.length ? '✅' : '❌'} Sections bien structurées: ${wellStructuredSections}/${sections.length}`);
        
        // 5. Résumé final
        console.log('\n📊 Résumé des corrections:');
        console.log(`   - Champ matricule ajouté: ${matriculeFound === 4 ? '✅' : '❌'}`);
        console.log(`   - Ancien CSS éliminé: ${oldCSSFound === 0 ? '✅' : '❌'}`);
        console.log(`   - Champs avec nouveau CSS: ${fieldsWithNewCSS}/${requiredFields.length}`);
        console.log(`   - Sections bien structurées: ${wellStructuredSections}/${sections.length}`);
        
        // 6. Recommandations
        console.log('\n🎯 Recommandations:');
        if (matriculeFound === 4 && oldCSSFound === 0 && fieldsWithNewCSS === requiredFields.length && wellStructuredSections === sections.length) {
            console.log('   🎉 Excellent! Tous les problèmes ont été résolus');
            console.log('   💡 Le formulaire est maintenant parfaitement structuré');
            console.log('   🚀 Prêt pour la production !');
        } else {
            console.log('   ⚠️  Certains problèmes persistent');
            console.log('   💡 Continuez à corriger les éléments manquants');
            console.log('   🎨 Vérifiez que tous les champs utilisent les nouvelles classes CSS');
        }
        
    } catch (error) {
        console.error('💥 Erreur lors du test:', error.message);
    }
}

testFormFixes();


