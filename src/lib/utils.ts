/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/utils.ts
export function isProfileIncomplete(user: any) {
  return !user.telephone || !user.adresse || !user.ville || !user.codePostal || !user.firstName || !user.lastName;
}