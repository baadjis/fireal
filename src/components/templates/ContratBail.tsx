/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 50, 
    fontSize: 10, 
    fontFamily: 'Helvetica', 
    lineHeight: 1.6, 
    color: '#333' 
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  brand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  title: { 
    fontSize: 18, 
    marginTop: 20,
    marginBottom: 20, 
    textAlign: 'center', 
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  h2: { 
    fontSize: 11, 
    marginTop: 15, 
    marginBottom: 8, 
    fontWeight: 'bold', 
    textDecoration: 'underline',
    color: '#000'
  },
  section: { marginBottom: 10 },
  text: { 
    marginBottom: 6, 
    textAlign: 'justify',
    fontSize: 10
  },
  bold: { fontWeight: 'bold' },
  signatureSection: { 
    marginTop: 50, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  signatureBox: {
    width: '45%',
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eee',
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTopWidth: 0.5,
    borderTopStyle: 'solid',
    borderTopColor: '#eee',
    paddingTop: 5,
  }
});

export const ContratBail = ({ locataire, bien, proprietaire }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* En-tête LocAm */}
      <View style={styles.header}>
        <Text style={styles.brand}>LocAm - Gestion Locative</Text>
      </View>

      <Text style={styles.title}>Contrat de Location (Bail d&apos;habitation)</Text>
      <Text style={{ textAlign: 'center', fontSize: 9, marginBottom: 20 }}>
        Soumis aux dispositions de la loi n° 89-462 du 6 juillet 1983 (Loi ALUR)
      </Text>
      
      <Text style={styles.h2}>I. DÉSIGNATION DES PARTIES</Text>
      <View style={styles.section}>
        <Text style={styles.text}>
          <Text style={styles.bold}>Le Bailleur : </Text>
          {proprietaire.name}, joignable à l&apos;adresse {proprietaire.email}.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Le Locataire : </Text>
          {locataire.prenom} {locataire.nom}, né(e) le [Date de naissance à compléter].
        </Text>
      </View>

      <Text style={styles.h2}>II. OBJET DU CONTRAT</Text>
      <View style={styles.section}>
        <Text style={styles.text}>
          Le bailleur loue au locataire un logement de type {bien.type} situé au : 
          {bien.adresse}, {bien.codePostal} {bien.ville}.
        </Text>
        <Text style={styles.text}>
          Détails techniques : Surface habitable de {bien.surface || 'ND'} m². 
          Situé au niveau : {bien.etage === 0 ? 'Rez-de-chaussée' : bien.etage + 'ème étage'}.
          Porte : {bien.numeroPorte || 'Non précisé'}.
        </Text>
      </View>

      <Text style={styles.h2}>III. CONDITIONS FINANCIÈRES</Text>
      <View style={styles.section}>
        <Text style={styles.text}>
          Le présent contrat est consenti moyennant un loyer mensuel de {locataire.loyerHC.toFixed(2)} € hors charges, 
          auquel s&apos;ajoute une provision sur charges de {locataire.charges.toFixed(2)} €.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Montant total mensuel : {(locataire.loyerHC + locataire.charges).toFixed(2)} € TTC.</Text>
        </Text>
        <Text style={styles.text}>
          Le loyer est payable le {locataire.jourPaiement} de chaque mois.
        </Text>
      </View>

      <Text style={styles.h2}>IV. DÉPÔT DE GARANTIE</Text>
      <View style={styles.section}>
        <Text style={styles.text}>
          À la signature du présent contrat, le locataire verse un dépôt de garantie correspondant à un mois de loyer hors charges, soit la somme de {locataire.loyerHC.toFixed(2)} €.
        </Text>
      </View>

      <Text style={styles.h2}>V. DURÉE DU CONTRAT</Text>
      <View style={styles.section}>
        <Text style={styles.text}>
          Le présent contrat est conclu pour une durée de [3 ans pour un non-meublé / 1 an pour un meublé] à compter du {new Date().toLocaleDateString('fr-FR')}.
        </Text>
      </View>

      {/* Zone de signatures corrigée avec bordures valides */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <Text style={[styles.bold, { marginBottom: 10 }]}>Le Bailleur</Text>
          <Text style={{ fontSize: 8, color: '#999' }}>(Signature précédée de la mention &quot;Lu et approuvé&quot;)</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={[styles.bold, { marginBottom: 10 }]}>Le Locataire</Text>
          <Text style={{ fontSize: 8, color: '#999' }}>(Signature précédée de la mention &quot;Lu et approuvé&quot;)</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        Document généré par LocAm - Plateforme de gestion locative - www.getlocam.com
      </Text>
    </Page>
  </Document>
);