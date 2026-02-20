/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  brand: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
  addressBox: { width: '45%' },
  title: { fontSize: 16, textAlign: 'center', backgroundColor: '#f3f4f6', padding: 10, marginBottom: 20, fontWeight: 'bold' },
  label: { fontWeight: 'bold', marginBottom: 2, fontSize: 9, color: '#666' },
  table: { marginTop: 20 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', paddingBottom: 5, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#eee', paddingVertical: 8 },
  col1: { width: '70%' },
  col2: { width: '30%', textAlign: 'right' },
  total: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  totalBox: { width: '40%', borderTopWidth: 2, paddingTop: 5 },
  rib: { marginTop: 40, padding: 10, backgroundColor: '#fafafa', border: 0.5, borderColor: '#ddd' }
});

export const AvisEcheance = ({ locataire, proprietaire, mois, annee }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.addressBox}>
          <Text style={styles.label}>BAILLEUR</Text>
          <Text style={{ fontWeight: 'bold' }}>{proprietaire.name}</Text>
          <Text>{proprietaire.email}</Text>
        </View>
        <View style={styles.addressBox}>
          <Text style={styles.label}>LOCATAIRE</Text>
          <Text style={{ fontWeight: 'bold' }}>{locataire.prenom} {locataire.nom}</Text>
          <Text>{locataire.bien.adresse}</Text>
          <Text>{locataire.bien.codePostal} {locataire.bien.ville}</Text>
        </View>
      </View>

      <Text style={styles.title}>AVIS D&apos;ÉCHÉANCE DE LOYER</Text>
      
      <Text>Objet : Appel de loyer pour la période du mois de {mois} {annee}</Text>
      <Text style={{ marginTop: 10 }}>Logement : {locataire.bien.nom} - {locataire.bien.adresse}</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Désignation</Text>
          <Text style={styles.col2}>Montant</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>Loyer principal (Hors charges)</Text>
          <Text style={styles.col2}>{locataire.loyerHC.toFixed(2)} €</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>Provisions sur charges</Text>
          <Text style={styles.col2}>{locataire.charges.toFixed(2)} €</Text>
        </View>
      </View>

      <View style={styles.total}>
        <View style={styles.totalBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold' }}>TOTAL À PAYER :</Text>
            <Text style={{ fontWeight: 'bold' }}>{(locataire.loyerHC + locataire.charges).toFixed(2)} €</Text>
          </View>
        </View>
      </View>

      <View style={styles.rib}>
        <Text style={styles.label}>MODE DE RÈGLEMENT :</Text>
        <Text>Merci de régler votre loyer avant le {locataire.jourPaiement} {mois} par virement bancaire.</Text>
        <Text style={{ marginTop: 5, fontSize: 8 }}>Référence du virement : LOYER_{locataire.nom.toUpperCase()}_{mois.toUpperCase()}</Text>
      </View>
    </Page>
  </Document>
);