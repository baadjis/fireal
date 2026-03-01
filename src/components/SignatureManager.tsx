'use client'

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Upload, Type, PenLine, Check, Trash2 } from 'lucide-react';
import { updateSignature } from '@/app/actions/user';

export function SignatureManager({ initialSignature }: { initialSignature?: string | null }) {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [preview, setPreview] = useState<string | null>(initialSignature || null);
  const [typedName, setTypedName] = useState("");
  const sigCanvas = useRef<SignatureCanvas>(null);

  // --- LOGIQUE SAUVEGARDE ---
  const saveSignature = async (base64Data: string) => {
    const res = await updateSignature(base64Data);
    if (res.success) {
      setPreview(base64Data);
      alert("Signature enregistrée !");
    }
  };

  // Option 1 : Dessin
  const handleDrawSave = () => {
    if (sigCanvas.current?.isEmpty()) return;
    const data = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (data) saveSignature(data);
  };

  // Option 2 : Texte généré (Cursive)
  const handleTypeSave = () => {
    // On crée un canvas invisible pour transformer le texte en image
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = "40px 'Dancing Script', cursive"; // Assurez-vous d'importer la font ou utiliser une font système
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText(typedName, 200, 80);
      saveSignature(canvas.toDataURL());
    }
  };

  // Option 3 : Upload d'image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => saveSignature(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Ma Signature Fac-similé</h3>
        {preview && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Configurée</span>}
      </div>

      {/* Aperçu Actuel */}
      {preview && (
        <div className="relative group w-fit bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
          <img src={preview} alt="Signature" className="h-20 w-auto" />
          <button 
            onClick={() => setPreview(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Sélecteur de mode */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button onClick={() => setTab('draw')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${tab === 'draw' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
          <PenLine size={16} /> Dessiner
        </button>
        <button onClick={() => setTab('type')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${tab === 'type' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
          <Type size={16} /> Taper
        </button>
        <button onClick={() => setTab('upload')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${tab === 'upload' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
          <Upload size={16} /> Image
        </button>
      </div>

      <div className="border rounded-xl p-4 min-h-[160px] flex items-center justify-center bg-white">
        {tab === 'draw' && (
          <div className="w-full">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ className: "w-full h-32 border-b" }} 
            />
            <button onClick={handleDrawSave} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Enregistrer le dessin</button>
          </div>
        )}

        {tab === 'type' && (
          <div className="w-full space-y-4">
            <input 
              type="text" 
              placeholder="Tapez votre nom complet" 
              className="w-full p-3 border rounded-xl text-2xl italic text-center outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: 'cursive' }}
              onChange={(e) => setTypedName(e.target.value)}
            />
            <button onClick={handleTypeSave} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Générer à partir du texte</button>
          </div>
        )}

        {tab === 'upload' && (
          <div className="text-center w-full">
            <label className="cursor-pointer block p-8 border-2 border-dashed rounded-xl hover:bg-gray-50 transition">
              <Upload className="mx-auto text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 font-medium">Cliquez pour charger un scan de signature (PNG, JPG)</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}