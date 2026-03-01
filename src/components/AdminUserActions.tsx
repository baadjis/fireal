/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from "react"
import { MoreHorizontal, ShieldCheck, Trash2, Zap, UserCircle, Loader2 } from "lucide-react"
import { changeUserPlan, deleteUser } from "@/app/actions/admin"

export function AdminUserActions({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true)
    await action()
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors relative z-10"
      >
        {loading ? <Loader2 className="animate-spin text-slate-400" size={18} /> : <MoreHorizontal size={18} className="text-slate-400" />}
      </button>

      {isOpen && (
        <>
          {/* OVERLAY : Doit être en fixed pour couvrir TOUT l'écran et permettre de fermer */}
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          
          {/* 
              MENU : 
              - z-[110] pour être au dessus de l'overlay
              - position absolute
              - origin-top-right pour l'animation
          */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] py-2 animate-in fade-in zoom-in duration-150 origin-top-right">
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Options du compte</p>
            </div>
            
            <button onClick={() => handleAction(() => changeUserPlan(user.id, "BASIC"))} className="w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 text-slate-600 transition">
              <UserCircle size={14} className="text-blue-500" /> Plan Basic
            </button>
            <button onClick={() => handleAction(() => changeUserPlan(user.id, "PRO"))} className="w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 text-slate-600 transition">
              <Zap size={14} className="text-amber-500" /> Plan Pro
            </button>
            <button onClick={() => handleAction(() => changeUserPlan(user.id, "EXPERT"))} className="w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 text-slate-600 transition">
              <ShieldCheck size={14} className="text-purple-500" /> Plan Expert
            </button>

            <div className="h-px bg-slate-50 my-2" />
            
            <button onClick={() => handleAction(() => deleteUser(user.id))} className="w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 text-red-500 hover:bg-red-50 transition">
              <Trash2 size={14} /> Supprimer l&apos;utilisateur
            </button>
          </div>
        </>
      )}
    </div>
  )
}