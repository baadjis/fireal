'use client'

import { Trash2, Archive } from "lucide-react";
import { archiveLocataire, deleteLocataire } from "@/app/actions/tenant";

interface DangerZoneProps {
  id: string;
}

export function DangerZoneActions({ id }: DangerZoneProps) {
  
  const handleArchive = async (formData: FormData) => {
    if (confirm("Archiver ce locataire ? Il ne sera plus visible dans vos listes.")) {
      await archiveLocataire(id);
    }
  };

  const handleDelete = async (formData: FormData) => {
    if (confirm("ATTENTION : Supprimer définitivement ce locataire et tout son historique ? Cette action est irréversible.")) {
      await deleteLocataire(id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* BOUTON ARCHIVER */}
      <form action={handleArchive} className="flex-1">
        <button 
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-3 rounded-xl font-bold hover:bg-red-50 transition"
        >
          <Archive size={18} /> Archiver le dossier
        </button>
      </form>

      {/* BOUTON SUPPRIMER */}
      <form action={handleDelete} className="flex-1">
        <button 
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-sm"
        >
          <Trash2 size={18} /> Supprimer définitivement
        </button>
      </form>
    </div>
  );
}