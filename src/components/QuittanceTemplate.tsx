/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', textDecoration: 'underline' },
  section: { marginBottom: 15 },
  
  label: { fontWeight: 'bold' },
   box: { 
    borderWidth: 1,         // Au lieu de border: 1
    borderStyle: 'solid',   // Obligatoire pour éviter l'erreur "Invalid border style"
    borderColor: '#000000', // Couleur explicite
    padding: 10, 
    marginTop: 20 
  },
  
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5 
  },

  // CORRECTION AUSSI ICI pour la ligne de total si vous l'avez utilisée :
  totalRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    borderTopWidth: 1,      // Au lieu de borderTop: 1
    borderTopStyle: 'solid',
    borderTopColor: '#000000',
    paddingTop: 5, 
    marginTop: 5
  },
  footer: { marginTop: 50, textAlign: 'right' },
  bold: { fontWeight: 'bold' }
});

export const QuittanceTemplate = ({ locataire, proprietaire, mois, annee }: any) => {
  const total = locataire.loyerHC + locataire.charges;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>QUITTANCE DE LOYER</Text>
          <Text style={{ marginTop: 5 }}>Période : {mois} {annee}</Text>
        </View>

        {/* Coordonnées */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
          <View>
            <Text style={styles.label}>PROPRIÉTAIRE :</Text>
            <Text>{proprietaire.name}</Text>
            <Text>{proprietaire.email}</Text>
          </View>
          <View>
            <Text style={styles.label}>LOCATAIRE :</Text>
            <Text>{locataire.prenom} {locataire.nom}</Text>
            <Text>{locataire.bien.adresse}</Text>
            <Text>{locataire.bien.codePostal} {locataire.bien.ville}</Text>
          </View>
        </View>

        <Text style={styles.section}>
          Je soussigné, {proprietaire.name}, propriétaire du logement situé au {locataire.bien.adresse}, 
          déclare avoir reçu de la part de {locataire.prenom} {locataire.nom}, la somme de {total.toFixed(2)} € 
          au titre du loyer et des charges pour la période du mois de {mois} {annee}.
        </Text>

        {/* Détail financier */}
        <View style={styles.box}>
          <View style={styles.row}>
            <Text>Loyer Hors Charges :</Text>
            <Text>{locataire.loyerHC.toFixed(2)} €</Text>
          </View>
          <View style={styles.row}>
            <Text>Provision pour charges :</Text>
            <Text>{locataire.charges.toFixed(2)} €</Text>
          </View>
          <View style={[styles.row, { borderTop: 1, paddingTop: 5, marginTop: 5 }]}>
            <Text style={styles.label}>TOTAL REÇU :</Text>
            <Text style={styles.label}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        <Text style={{ marginTop: 20, fontSize: 10, fontStyle: 'italic' }}>
          Cette quittance annule tout reçu relatif au même terme. Elle ne peut en aucun cas servir de preuve de paiement des termes antérieurs.
        </Text>

        <View style={styles.footer}>
          <Text>Fait à {locataire.bien.ville}, le {new Date().toLocaleDateString()}</Text>
          <Text style={{ marginTop: 10 }}>Signature :</Text>
          <Text style={{ marginTop: 10 }}>{proprietaire.name}</Text>
        </View>
      </Page>
    </Document>
  );
};