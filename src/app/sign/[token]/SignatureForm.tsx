'use client'

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { signContractAction } from '@/app/actions/tenant';
import { PenTool, CheckCircle } from 'lucide-react';

export function SignatureForm({ token, locataireNom }: { token: string, locataireNom: string }) {
  const [mention, setMention] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleSubmit = async () => {
    if (mention.toLowerCase() !== "lu et approuvé") {
      alert("Veuillez recopier la mention 'Lu et approuvé'");
      return;
    }
    if (sigCanvas.current?.isEmpty()) {
      alert("Veuillez dessiner votre signature");
      return;
    }

    setLoading(true);
    const data = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') as string;
    const res = await signContractAction(token, data, mention);
    setLoading(false);

    if (res.success) setSuccess(true);
    else alert(res.error);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-green-900">Contrat signé !</h2>
        <p className="text-green-700 mt-2">Votre propriétaire a été informé. Vous pouvez fermer cette page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Recopiez la mention &quot;Lu et approuvé&quot;
        </label>
        <input 
          type="text" 
          value={mention}
          onChange={(e) => setMention(e.target.value)}
          placeholder="Tapez ici..."
          className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Dessinez votre signature ci-dessous
        </label>
        <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden">
          <SignatureCanvas 
            ref={sigCanvas}
            penColor="#000"
            canvasProps={{ className: "w-full h-48 cursor-crosshair" }} 
          />
        </div>
        <button 
          onClick={() => sigCanvas.current?.clear()} 
          className="text-xs text-slate-400 mt-2 hover:text-red-500 underline"
        >
          Effacer et recommencer
        </button>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition disabled:bg-slate-300 shadow-lg shadow-blue-100"
      >
        {loading ? "Traitement..." : "Signer le contrat de bail"}
      </button>
    </div>
  );
}