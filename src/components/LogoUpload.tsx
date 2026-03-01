'use client'

import React, { useState } from "react";
import Image from "next/image"; // Importation de Next Image
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";

interface LogoUploadProps {
  initialLogo?: string | null;
}

export function LogoUpload({ initialLogo }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialLogo || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validation de la taille (Max 1 Mo pour le stockage en Base64 dans la DB)
      if (file.size > 1024 * 1024) {
        setError("L'image est trop lourde (max 1 Mo).");
        return;
      }

      // Validation du type
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner un fichier image (PNG, JPG).");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4 border-b border-slate-100 pb-8">
      <div className="flex items-center gap-2">
        <ImageIcon size={16} className="text-blue-600" />
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Logo du bailleur / Agence
        </label>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Zone de prévisualisation */}
        <div className="relative w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center overflow-hidden group transition-all hover:border-blue-300">
          {preview ? (
            <>
              {/* Utilisation de Next/Image */}
              <Image 
                src={preview} 
                alt="Logo preview" 
                fill // Utilise tout l'espace du parent relative
                style={{ objectFit: 'contain', padding: '12px' }}
                unoptimized // Obligatoire pour les sources Base64/Blob
              />
              <button 
                type="button"
                onClick={removeLogo}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                title="Supprimer le logo"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-300">
              <Upload size={24} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Vide</span>
            </div>
          )}
        </div>

        {/* Zone d'action */}
        <div className="flex-1 space-y-3 w-full">
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500
                file:mr-4 file:py-2.5 file:px-6
                file:rounded-xl file:border-0
                file:text-xs file:font-black file:uppercase file:tracking-widest
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 transition-all cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Format recommandé : <span className="text-slate-600 font-bold">PNG transparent</span>. <br /> 
            Apparaîtra sur vos quittances et contrats.
          </p>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase animate-pulse">
              <AlertCircle size={12} />
              {error}
            </div>
          )}
        </div>
      </div>

      <input type="hidden" name="logoUrl" value={preview || ""} />
    </div>
  );
}