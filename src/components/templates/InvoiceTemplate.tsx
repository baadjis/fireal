/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatAdminAddress } from '@/lib/format';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1e293b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottom: 2, borderBottomColor: '#2563eb', borderBottomStyle: 'solid', paddingBottom: 10 },
  brand: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, textTransform: 'uppercase' },
  section: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  label: { fontWeight: 'bold', color: '#2563eb', marginBottom: 4, fontSize: 8, textTransform: 'uppercase' },
  table: { marginTop: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 10, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f1f5f9', padding: 10 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8' }
});

export const InvoiceTemplate = ({ invoice, user }: any) => {
  const userAddress = formatAdminAddress(user.adresse, user.codePostal, user.ville);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>LocAm.</Text>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontWeight: 'bold' }}>Facture n° {invoice.number}</Text>
            <Text>Date : {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={{ width: '45%' }}>
            <Text style={styles.label}>Émetteur</Text>
            <Text style={{ fontWeight: 'bold' }}>LocAm SAS</Text>
            <Text>123 Avenue de la République</Text>
            <Text>75011 PARIS</Text>
            <Text>SIRET : 123 456 789 00012</Text>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.label}>Client</Text>
            <Text style={{ fontWeight: 'bold' }}>{user.firstName} {user.lastName}</Text>
            <Text>{userAddress.street}</Text>
            <Text>{userAddress.cityLine}</Text>
          </View>
        </View>

        <Text style={styles.title}>Détail de votre abonnement</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ width: '70%' }}>Description du service</Text>
            <Text style={{ width: '30%', textAlign: 'right' }}>Montant TTC</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ width: '70%' }}>{invoice.type === 'SUBSCRIPTION_PRO' ? 'Abonnement LocAm Plan PRO - Mensuel' : 'Frais de service signature'}</Text>
            <Text style={{ width: '30%', textAlign: 'right' }}>{invoice.amount.toFixed(2)} €</Text>
          </View>
        </View>

        <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
          <View style={{ width: '40%', backgroundColor: '#2563eb', padding: 10, borderRadius: 5, color: 'white' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold' }}>TOTAL PAYÉ :</Text>
              <Text style={{ fontWeight: 'bold' }}>{invoice.amount.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>LocAm — www.getlocam.com — Merci pour votre confiance !</Text>
      </Page>
    </Document>
  );
};