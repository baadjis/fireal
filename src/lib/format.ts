
/**
 * Version pour formater uniquement le prénom (ex: pour les e-mails)
 */
export function capitalizeFirstLetter(string: string = "") {
  return string.trim().charAt(0).toUpperCase() + string.trim().slice(1).toLowerCase();
}


// lib/format.ts

/**
 * Formate une adresse de manière administrative.
 * Exemple: "12 rue de la paix", "75001", "paris" -> "12 rue de la paix, 75001 PARIS"
 */
export function formatAdminAddress(adresse: string = "", codePostal: string = "", ville: string = "") {
  const s = adresse.trim();
  const cp = codePostal.trim();
  const v = ville.trim().toUpperCase(); // La ville est toujours en majuscules en administratif

  return {
    inline: `${s}, ${cp} ${v}`,
    street: s,
    cityLine: `${cp} ${v}`
  };
}

/**
 * Formate un nom complet en écriture administrative. (Rappel de la fonction précédente)
 */
export function formatAdminName(prenom: string = "", nom: string = "", fullName: string | null = null) {
  let p = prenom?.trim() || "";
  let n = nom?.trim() || "";

  if (!p && !n && fullName) {
    const parts = fullName.trim().split(" ");
    p = parts[0] || "";
    n = parts.slice(1).join(" ") || "";
  }

  const formattedPrenom = p
    .split(/[- ]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');

  const formattedNom = n.toUpperCase();
  return `${formattedPrenom} ${formattedNom}`;
}