/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 50, fontSize: 10, lineHeight: 1.5 },
  title: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  h2: { fontSize: 12, marginTop: 15, marginBottom: 5, fontWeight: 'bold', textDecoration: 'underline' },
  section: { marginBottom: 10 },
  text: { marginBottom: 5, textAlign: 'justify' }
});

export const ContratBail = ({ locataire, bien, proprietaire }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>CONTRAT DE LOCATION (LOI ALUR)</Text>
      
      <Text style={styles.h2}>I. DÉSIGNATION DES PARTIES</Text>
      <Text style={styles.text}>Le présent contrat est conclu entre :</Text>
      <Text style={styles.text}>Le Bailleur : {proprietaire.name}, demeurant à {proprietaire.adresse}.</Text>
      <Text style={styles.text}>Le Locataire : {locataire.prenom} {locataire.nom}.</Text>

      <Text style={styles.h2}>II. OBJET DU CONTRAT</Text>
      <Text style={styles.text}>Le bailleur loue au locataire un logement de type {bien.type} situé au {bien.adresse}, {bien.codePostal} {bien.ville}.</Text>
      <Text style={styles.text}>Surface habitable : {bien.surface} m². Étage : {bien.etage}.</Text>

      <Text style={styles.h2}>III. CONDITIONS FINANCIÈRES</Text>
      <Text style={styles.text}>Le présent contrat est consenti moyennant un loyer mensuel de {locataire.loyerHC} € hors charges, plus une provision sur charges de {locataire.charges} €.</Text>
      <Text style={styles.text}>Le montant total dû chaque mois est de {locataire.loyerHC + locataire.charges} €.</Text>

      <Text style={styles.h2}>IV. DÉPÔT DE GARANTIE</Text>
      <Text style={styles.text}>À la signature, le locataire verse un dépôt de garantie correspondant à un mois de loyer hors charges.</Text>

      {/* Ajoutez ici les autres articles légaux... */}
      
      <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text>Signature du Bailleur</Text>
          <View style={{ height: 50 }} />
        </View>
        <View>
          <Text>Signature du Locataire</Text>
          <View style={{ height: 50 }} />
        </View>
      </View>
    </Page>
  </Document>
);