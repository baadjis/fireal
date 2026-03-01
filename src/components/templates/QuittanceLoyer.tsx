/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatAdminName, formatAdminAddress } from '@/lib/format';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1e293b' },
  
  // HEADER : Logo ou Infos Bailleur
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20
  },
  ownerLogo: { width: 120, height: 'auto', marginBottom: 5 },
  ownerInfo: { width: '60%' },
  docInfo: { width: '35%', textAlign: 'right' },
  brandTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },

  // Bloc des adresses
  addressSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  addressBox: { width: '45%' },
  label: { fontWeight: 'bold', fontSize: 8, color: '#2563eb', marginBottom: 4, textTransform: 'uppercase' },
  addressText: { fontSize: 10, lineHeight: 1.4 },

  titleContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 25,
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#bfdbfe'
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1e40af' },

  attestationBox: {
    marginBottom: 25,
    lineHeight: 1.6,
    textAlign: 'justify',
  },

  // TABLEAU
  table: { 
    marginTop: 10, 
    borderRadius: 8, 
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0' 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#f8fafc', 
    borderBottomWidth: 1, 
    borderBottomStyle: 'solid', 
    borderBottomColor: '#e2e8f0', 
    padding: 8, 
    fontWeight: 'bold' 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomStyle: 'solid', 
    borderBottomColor: '#f1f5f9', 
    padding: 8
  },
  tableRowTotal: { 
    flexDirection: 'row', 
    backgroundColor: '#2563eb', 
    padding: 10,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  colDesc: { width: '75%' },
  colMontant: { width: '25%', textAlign: 'right' },

  // SIGNATURE
  signatureSection: {
    marginTop: 40,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  signatureBlock: { width: 200, textAlign: 'center' },
  signatureTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 8, textDecoration: 'underline' },
  signatureImg: { width: 100, height: 'auto', marginHorizontal: 'auto', marginVertical: 5 },

  // FOOTER : Branding LocAm
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopStyle: 'solid',
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 8, color: '#94a3b8' },
  footerBrand: { fontSize: 8, color: '#2563eb', fontWeight: 'bold', marginLeft: 3 },

  footerNote: { fontSize: 7, color: '#94a3b8', fontStyle: 'italic', marginTop: 15 }
});

export const QuittanceLoyer = ({ locataire, proprietaire, mois, annee }: any) => {
  const moisIndex = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].indexOf(mois);
  const dernierJour = new Date(annee, moisIndex + 1, 0).getDate();
  const totalLoyer = (locataire.loyerHC || 0) + (locataire.charges || 0);

  // Utilisation des formats administratifs
  const locataireName = formatAdminName(locataire.prenom, locataire.nom);
  const proprietaireName = formatAdminName(proprietaire.firstName, proprietaire.lastName, proprietaire.name);
  
  const locAddress = formatAdminAddress(locataire.bien.adresse, locataire.bien.codePostal, locataire.bien.ville);
  const propAddress = formatAdminAddress(proprietaire.adresse, proprietaire.codePostal, proprietaire.ville);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* --- HEADER DYNAMIQUE --- */}
        <View style={styles.header}>
          <View style={styles.ownerInfo}>
            {proprietaire.logoUrl ? (
              <Image src={proprietaire.logoUrl} style={styles.ownerLogo} />
            ) : (
              <Text style={styles.brandTitle}>{proprietaireName}</Text>
            )}
            <Text style={[styles.addressText, { fontSize: 8, color: '#64748b' }]}>
              {propAddress.inline}
            </Text>
          </View>
          
          <View style={styles.docInfo}>
            <Text style={{ fontWeight: 'bold', color: '#2563eb', fontSize: 12 }}>QUITTANCE</Text>
            <Text style={{ marginTop: 4 }}>Réf: Q-{locataire.id.substring(0,5).toUpperCase()}</Text>
            <Text>Période: {mois} {annee}</Text>
          </View>
        </View>

        {/* --- ADRESSES --- */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.label}>Bailleur</Text>
            <Text style={[styles.addressText, { fontWeight: 'bold' }]}>{proprietaireName}</Text>
            <Text style={styles.addressText}>{proprietaire.email}</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.label}>Locataire</Text>
            <Text style={[styles.addressText, { fontWeight: 'bold' }]}>{locataireName}</Text>
            <Text style={styles.addressText}>{locAddress.street}</Text>
            <Text style={styles.addressText}>{locAddress.cityLine}</Text>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>QUITTANCE DE LOYER</Text>
        </View>

        <View style={styles.attestationBox}>
          <Text>
            Je soussigné, <Text style={{ fontWeight: 'bold' }}>{proprietaireName}</Text>, propriétaire du logement situé au {locAddress.inline}, 
            déclare avoir reçu de la part du locataire <Text style={{ fontWeight: 'bold' }}>{locataireName}</Text>, 
            la somme de <Text style={{ fontWeight: 'bold' }}>{totalLoyer.toFixed(2)} €</Text>, au titre du loyer 
            et des charges pour la période d&apos;occupation du <Text style={{ fontWeight: 'bold' }}>1er au {dernierJour} {mois} {annee}</Text>.
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Désignation</Text>
            <Text style={styles.colMontant}>Montant (€)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>Loyer principal (Hors charges)</Text>
            <Text style={styles.colMontant}>{locataire.loyerHC.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>Provisions sur charges</Text>
            <Text style={styles.colMontant}>{locataire.charges.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRowTotal}>
            <Text style={styles.colDesc}>TOTAL REÇU</Text>
            <Text style={styles.colMontant}>{totalLoyer.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Cette quittance annule tout reçu relatif au même terme. Elle ne peut en aucun cas servir de preuve de paiement des termes antérieurs. 
          À conserver 3 ans (Loi n° 89-462 du 6 juillet 1989).
        </Text>

        {/* --- SIGNATURE --- */}
        <View style={styles.signatureSection}>
          <Text style={{ marginBottom: 5 }}>Fait à {locataire.bien.ville}, le {new Date().toLocaleDateString('fr-FR')}</Text>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>Signature du Bailleur</Text>
            {proprietaire.signatureData ? (
              <Image src={proprietaire.signatureData} style={styles.signatureImg} />
            ) : (
              <View style={{ height: 40 }} />
            )}
            <Text style={{ fontWeight: 'bold' }}>{proprietaireName}</Text>
          </View>
        </View>

        {/* --- MARQUE LocAm --- */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Document édité par</Text>
          <Text style={styles.footerBrand}>LocAm.</Text>
          <Text style={[styles.footerText, { marginLeft: 4 }]}>— www.getlocam.com</Text>
        </View>

      </Page>
    </Document>
  );
};