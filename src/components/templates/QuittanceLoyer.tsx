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
  
  // CORRECTION : Ajout de borderStyle sur toutes les bordures
  tableHeader: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomStyle: 'solid', 
    borderBottomColor: '#000', 
    paddingBottom: 5, 
    fontWeight: 'bold' 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 0.5, 
    borderBottomStyle: 'solid', 
    borderBottomColor: '#eee', 
    paddingVertical: 8 
  },
  
  col1: { width: '70%' },
  col2: { width: '30%', textAlign: 'right' },
  total: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  
  // CORRECTION : borderTopStyle ajouté
  totalBox: { 
    width: '40%', 
    borderTopWidth: 2, 
    borderTopStyle: 'solid', 
    borderTopColor: '#000', 
    paddingTop: 5 
  },
  
  // CORRECTION : borderStyle ajouté et border remplacé par borderWidth
  rib: { 
    marginTop: 40, 
    padding: 10, 
    backgroundColor: '#fafafa', 
    borderWidth: 0.5, 
    borderStyle: 'solid', 
    borderColor: '#ddd' 
  },

  // Style pour le bloc d'attestation corrigé
  attestationBox: {
    marginBottom: 30, 
    padding: 15, 
    borderWidth: 1, 
    borderStyle: 'solid', 
    borderColor: '#000'
  }
});

export const QuittanceLoyer = ({ locataire, proprietaire, mois, annee }: any) => {
  // Calcul dynamique du dernier jour du mois pour la période d'occupation
  // On crée une date au 1er jour du mois suivant, puis on retire 1 jour.
  const moisIndex = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].indexOf(mois);
  const dernierJour = new Date(annee, moisIndex + 1, 0).getDate();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>LocAm</Text>
          <Text>Quittance n° Q-{locataire.id.substring(0,5)}-{mois.substring(0,3).toUpperCase()}{annee}</Text>
        </View>

        <Text style={styles.title}>QUITTANCE DE LOYER</Text>

        {/* Utilisation du style corrigé attestationBox */}
        <View style={styles.attestationBox}>
          <Text style={{ lineHeight: 1.5 }}>
            Je soussigné, <Text style={{ fontWeight: 'bold' }}>{proprietaire.name}</Text>, propriétaire du logement situé au {locataire.bien.adresse}, 
            déclare avoir reçu de la part du locataire <Text style={{ fontWeight: 'bold' }}>{locataire.prenom} {locataire.nom}</Text>, 
            la somme de <Text style={{ fontWeight: 'bold' }}>{(locataire.loyerHC + locataire.charges).toFixed(2)} €</Text>, au titre du loyer 
            et des charges pour la période d&apos;occupation du <Text style={{ fontWeight: 'bold' }}>1er au {dernierJour} {mois} {annee}</Text>.
          </Text>
        </View>

        {/* Détail financier */}
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
              <Text style={{ fontWeight: 'bold' }}>TOTAL REÇU :</Text>
              <Text style={{ fontWeight: 'bold' }}>{(locataire.loyerHC + locataire.charges).toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 9, fontStyle: 'italic' }}>
            Cette quittance annule tout reçu relatif au même terme. Elle ne peut en aucun cas servir de preuve de paiement des termes antérieurs et ne préjuge pas des paiements à venir.
          </Text>
          <View style={{ marginTop: 30, textAlign: 'right' }}>
            <Text>Fait à {locataire.bien.ville}, le {new Date().toLocaleDateString('fr-FR')}</Text>
            <Text style={{ marginTop: 10 }}>Signature du Bailleur :</Text>
            <View style={{ height: 60 }} />
            <Text>{proprietaire.name}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};