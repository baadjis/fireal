/* eslint-disable @typescript-eslint/no-explicit-any */
// components/QuittancePDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  header: { marginBottom: 20, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  section: { marginBottom: 10 }
});

export const QuittancePDF = ({ locataire, mois }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>QUITTANCE DE LOYER</Text>
      <View style={styles.section}>
        <Text>Locataire : {locataire.nom}</Text>
        <Text>Période : {mois}</Text>
        <Text>Montant Loyer : {locataire.loyer} €</Text>
        <Text>Charges : {locataire.charges} €</Text>
        <Text style={{ marginTop: 20, fontWeight: 'bold' }}>
          Total Reçu : {locataire.loyer + locataire.charges} €
        </Text>
      </View>
    </Page>
  </Document>
);