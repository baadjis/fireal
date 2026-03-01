/* eslint-disable @typescript-eslint/no-explicit-any */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  // 1. Extraire les en-têtes (clés du premier objet)
  const headers = Object.keys(data[0]);
  
  // 2. Créer les lignes
  const csvRows = [
    headers.join(','), // Ligne d'en-tête
    ...data.map(row => 
      headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? "" : row[header];
        // On entoure de guillemets pour éviter les problèmes avec les virgules dans les adresses
        return `"${val.toString().replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];

  // 3. Créer le lien de téléchargement
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}