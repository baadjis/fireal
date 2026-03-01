/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatAdminName, formatAdminAddress } from '@/lib/format';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 8.5, fontFamily: 'Helvetica', lineHeight: 1.4, color: '#1e293b' },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 10
  },
  brand: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  docInfo: { textAlign: 'right', fontSize: 7, color: '#64748b' },

  // Titre principal
  titleContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#bfdbfe'
  },
  title: { fontSize: 13, fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase' },

  // Sections h2
  h2: { 
    fontSize: 9, 
    marginTop: 12, 
    marginBottom: 6, 
    fontWeight: 'bold', 
    backgroundColor: '#f8fafc',
    padding: 4,
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: '#2563eb',
    color: '#0f172a'
  },

  sectionContent: { marginBottom: 10, paddingLeft: 10 },
  text: { marginBottom: 4, textAlign: 'justify' },
  bold: { fontWeight: 'bold', color: '#0f172a' },
  italic: { fontStyle: 'italic', color: '#64748b' },

  // Tableau financier
  table: { 
    marginTop: 5, 
    marginBottom: 8,
    borderRadius: 4, 
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0' 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomStyle: 'solid', 
    borderBottomColor: '#f1f5f9', 
    padding: 5
  },
  tableRowTotal: { 
    flexDirection: 'row', 
    backgroundColor: '#2563eb', 
    padding: 6,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  colDesc: { width: '75%' },
  colMontant: { width: '25%', textAlign: 'right' },

  // Boîtes de texte (Inventaire / Clauses)
  clauseBox: {
    marginTop: 5,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderRadius: 6,
    color: '#475569'
  },

  // Grid de signatures
  signatureGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  signatureBox: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minHeight: 140,
    textAlign: 'center'
  },
  signatureLabel: { fontSize: 8, fontWeight: 'bold', marginBottom: 4, textDecoration: 'underline' },
  sigImage: {
    width: 90,
    height: 35,
    marginHorizontal: 'auto',
    marginVertical: 5,
    objectFit: 'contain'
  },
  proofText: { fontSize: 6, color: '#94a3b8', marginTop: 2 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    borderTopWidth: 0.5,
    borderTopStyle: 'solid',
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  footerBrand: { color: '#2563eb', fontWeight: 'bold' }
});

export const ContratBail = ({ locataire, bien, proprietaire }: any) => {
  // Logique métier
  const colocataires = bien.locataires?.filter((l: any) => l.active && !l.archived) || [locataire];
  const isColoc = colocataires.length > 1;
  const totalMensuel = (locataire.loyerHC || 0) + (locataire.charges || 0);
  
  // Logique Meublé vs Nu
  const typeBailLabel = bien.isMeuble ? "MEUBLÉ" : "NON-MEUBLÉ (NU)";
  const dureeBail = bien.isMeuble ? "1 an (renouvelable)" : "3 ans (renouvelable)";
  const depotGarantieMax = bien.isMeuble ? "2 mois de loyer HC" : "1 mois de loyer HC";

  // Formats
  const proprietaireDisplay = formatAdminName(proprietaire.firstName, proprietaire.lastName, proprietaire.name);
  const propAddr = formatAdminAddress(proprietaire.adresse, proprietaire.codePostal, proprietaire.ville);
  const bienAddr = formatAdminAddress(bien.adresse, bien.codePostal, bien.ville);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <Text style={styles.brand}>LocAm.</Text>
          <View style={styles.docInfo}>
            <Text>CONTRAT DE BAIL D&apos;HABITATION {typeBailLabel}</Text>
            <Text>Réf : {locataire.id.substring(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* TITRE */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Bail de location soumis à la loi du 6 juillet 1989</Text>
          <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>Mise en conformité Loi ALUR effectuée le {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
        
        {/* I. PARTIES */}
        <Text style={styles.h2}>I. DÉSIGNATION DES PARTIES</Text>
        <View style={styles.sectionContent}>
          <Text style={styles.text}><Text style={styles.bold}>LE BAILLEUR : </Text>{proprietaireDisplay}, domicilié au {propAddr.inline}.</Text>
          <Text style={[styles.bold, { marginTop: 4 }]}>LE(S) LOCATAIRE(S) :</Text>
          {colocataires.map((c: any, i: number) => (
            <Text key={c.id} style={styles.text}>{i + 1}. {formatAdminName(c.prenom, c.nom)} (Email: {c.email})</Text>
          ))}
          {isColoc && (
            <Text style={[styles.italic, { fontSize: 8, marginTop: 2 }]}>Clause de solidarité : Les locataires sont tenus solidairement et indivisiblement à l&apos;exécution de toutes les obligations du présent bail.</Text>
          )}
        </View>

        {/* II. OBJET & INVENTAIRE */}
        <Text style={styles.h2}>II. OBJET DU CONTRAT ET CONSISTANCE DU LOGEMENT</Text>
        <View style={styles.sectionContent}>
          <Text style={styles.text}>Le bailleur loue un logement {bien.isMeuble ? 'meublé' : 'nu'} de type <Text style={styles.bold}>{bien.type}</Text> situé au {bienAddr.street}, {bienAddr.cityLine}.</Text>
          <Text style={styles.text}>Surface habitable : {bien.surface || '--'} m² | Étage : {bien.etage || 'RDC'} | Porte : {bien.numeroPorte || 'N/A'}.</Text>
          
          <Text style={[styles.bold, { marginTop: 4 }]}>Équipements et Accessoires :</Text>
          <View style={styles.clauseBox}>
            <Text style={styles.text}>{bien.inventaire || "Aucun inventaire spécifique renseigné. Le logement est loué avec ses équipements de base."}</Text>
          </View>
        </View>

        {/* III. DURÉE */}
        <Text style={styles.h2}>III. DURÉE DU CONTRAT</Text>
        <View style={styles.sectionContent}>
          <Text style={styles.text}>Le bail est conclu pour une durée de <Text style={styles.bold}>{dureeBail}</Text>.</Text>
          <Text style={styles.text}>Date de prise d&apos;effet : {locataire.dateDebutBail ? new Date(locataire.dateDebutBail).toLocaleDateString('fr-FR') : '[A COMPLÉTER]'}.</Text>
        </View>

        {/* IV. FINANCES */}
        <Text style={styles.h2}>IV. CONDITIONS FINANCIÈRES</Text>
        <View style={styles.sectionContent}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Loyer mensuel principal (Hors charges)</Text>
              <Text style={styles.colMontant}>{locataire.loyerHC.toFixed(2)} €</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Provisions mensuelles sur charges (Régularisation annuelle)</Text>
              <Text style={styles.colMontant}>{locataire.charges.toFixed(2)} €</Text>
            </View>
            <View style={styles.tableRowTotal}>
              <Text style={styles.colDesc}>TOTAL MENSUEL TTC</Text>
              <Text style={styles.colMontant}>{totalMensuel.toFixed(2)} €</Text>
            </View>
          </View>
          <Text style={styles.text}>Le paiement est dû le <Text style={styles.bold}>{locataire.jourPaiement}</Text> de chaque mois.</Text>
          <Text style={styles.text}>Dépôt de garantie : {locataire.loyerHC.toFixed(2)} € (Limite légale : {depotGarantieMax}).</Text>
        </View>

        {/* V. OBLIGATIONS (BLOC JURIDIQUE) */}
        <Text style={styles.h2}>V. OBLIGATIONS DU LOCATAIRE</Text>
        <View style={styles.sectionContent}>
          <Text style={styles.text}>1. Payer le loyer et les charges aux termes convenus.</Text>
          <Text style={styles.text}>2. User paisiblement des locaux selon la destination prévue.</Text>
          <Text style={styles.text}>3. Répondre des dégradations survenant pendant la durée du contrat.</Text>
          <Text style={styles.text}>4. Souscrire une assurance contre les risques locatifs (Obligatoire).</Text>
          <Text style={styles.text}>5. Permettre l&apos;accès pour les travaux nécessaires et l&apos;entretien.</Text>
        </View>

        {/* CONDITIONS PARTICULIÈRES */}
        {locataire.conditionsParticulieres && (
          <>
            <Text style={styles.h2}>VI. CONDITIONS PARTICULIÈRES</Text>
            <View style={styles.sectionContent}>
              <View style={styles.clauseBox}>
                <Text style={styles.text}>{locataire.conditionsParticulieres}</Text>
              </View>
            </View>
          </>
        )}

        {/* SIGNATURES */}
        <View wrap={false} style={{ marginTop: 20 }}>
          <Text style={styles.h2}>SIGNATURES DES PARTIES</Text>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Le Bailleur</Text>
              <Text style={styles.italic}>&quot;Lu et approuvé&quot;</Text>
              {proprietaire.signatureData ? (
                <Image src={proprietaire.signatureData} style={styles.sigImage} />
              ) : (
                <View style={{ height: 40 }} />
              )}
              <Text style={styles.bold}>{proprietaireDisplay}</Text>
              <Text style={styles.proofText}>Fait le {new Date().toLocaleDateString('fr-FR')}</Text>
            </View>

            {colocataires.map((c: any) => (
              <View key={c.id} style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>Locataire : {c.nom.toUpperCase()}</Text>
                <Text style={styles.italic}>Mention : {c.mentionLuApprouve || '.............................'}</Text>
                {c.signatureDataLocataire ? (
                  <Image src={c.signatureDataLocataire} style={styles.sigImage} />
                ) : (
                  <View style={{ height: 40, borderBottomWidth: 0.5, borderBottomStyle: 'dashed', borderBottomColor: '#ccc', marginVertical: 8 }} />
                )}
                <Text style={styles.proofText}>{c.dateSignature ? `Signé le ${new Date(c.dateSignature).toLocaleString('fr-FR')}` : "En attente de signature"}</Text>
                {c.ipSignature && <Text style={styles.proofText}>Preuve IP : {c.ipSignature}</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* FOOTER LocAm */}
        <View style={styles.footer} fixed>
          <Text>Document édité par <Text style={styles.footerBrand}>LocAm.</Text> — www.getlocam.com — Support : contact@getlocam.com</Text>
        </View>

      </Page>
    </Document>
  );
};