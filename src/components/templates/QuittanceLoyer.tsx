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
// Structure similaire mais avec un bloc "Attestation"
export const QuittanceLoyer = ({ locataire, proprietaire, mois, annee }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.brand}>LocaManager</Text>
        <Text>Quittance n° Q-{locataire.id.substring(0,5)}-{mois}</Text>
      </View>

      <Text style={styles.title}>QUITTANCE DE LOYER</Text>

      <View style={{ marginBottom: 30, padding: 15, border: 1, borderColor: '#000' }}>
        <Text style={{ lineHeight: 1.5 }}>
          Je soussigné, <Text style={{ fontWeight: 'bold' }}>{proprietaire.name}</Text>, propriétaire du logement situé au {locataire.bien.adresse}, 
          déclare avoir reçu de la part du locataire <Text style={{ fontWeight: 'bold' }}>{locataire.prenom} {locataire.nom}</Text>, 
          la somme de <Text style={{ fontWeight: 'bold' }}>{(locataire.loyerHC + locataire.charges).toFixed(2)} €</Text>, au titre du loyer 
          et des charges pour la période d&apos;occupation du <Text style={{ fontWeight: 'bold' }}>1er au {new Date(2024, new Date().getMonth() + 1, 0).getDate()} {mois} {annee}</Text>.
        </Text>
      </View>

      {/* Détail financier identique à l'avis ... */}

      <View style={{ marginTop: 40 }}>
        <Text style={{ fontSize: 9, fontStyle: 'italic' }}>
          Cette quittance annule tout reçu relatif au même terme. Elle ne peut en aucun cas servir de preuve de paiement des termes antérieurs et ne préjuge pas des paiements à venir.
        </Text>
        <View style={{ marginTop: 30, textAlign: 'right' }}>
          <Text>Fait à {locataire.bien.ville}, le {new Date().toLocaleDateString()}</Text>
          <Text style={{ marginTop: 10 }}>Signature du Bailleur :</Text>
          <View style={{ height: 60 }} />
          <Text>{proprietaire.name}</Text>
        </View>
      </View>
    </Page>
  </Document>
);