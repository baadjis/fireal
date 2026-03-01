'use client'

import { useState, useEffect } from "react";
import { Eye, X, Download, Loader2 } from "lucide-react";

export function BailViewer({ locataireId, nomLocataire }: { locataireId: string, nomLocataire: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Empêcher le scroll du corps de la page quand la modale est ouverte
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
      >
        <Eye size={14} /> Voir le bail
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200">
          <div className="relative w-full h-full max-w-5xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header de la modale */}
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Aperçu du contrat</h3>
                <p className="text-sm text-slate-500">{nomLocataire}</p>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={`/api/contrat/${locataireId}`} 
                  download 
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Download size={20} />
                </a>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Zone du PDF */}
            <div className="flex-1 bg-slate-100 relative">
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
              <iframe 
                src={`/api/contrat/${locataireId}#toolbar=0`} 
                className="w-full h-full border-none"
                title="Bail PDF"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}