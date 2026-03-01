/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from "react";
import { Bell, FileText, Wallet, ArrowRight, CheckCheck } from "lucide-react";
import Link from "next/link";
// Import des actions
import { markAsRead, markAllAsRead } from "@/app/actions/notifications";

export function NotificationBell({ notifications, unreadCount }: { notifications: any[], unreadCount: number }) {
  const [isOpen, setIsOpen] = useState(false);

  // Choix de l'icône selon le type
  const getIcon = (type: string) => {
    switch (type) {
      case "SIGNATURE": return <FileText className="text-blue-600" size={16} />;
      case "PAIEMENT": return <Wallet className="text-emerald-600" size={16} />;
      default: return <Bell className="text-slate-400" size={16} />;
    }
  };

  // Gestion du clic sur une notification
  const handleNotificationClick = async (id: string) => {
    setIsOpen(false);
    await markAsRead(id);
  };

  // Gestion du "Tout marquer comme lu"
  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative">
      {/* BOUTON CLOCHE */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-2xl transition-all relative border ${
          unreadCount > 0 
            ? "bg-blue-50 border-blue-100 text-blue-600 shadow-sm" 
            : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
        }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white border-2 border-white animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant à côté */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            
            {/* HEADER DU MENU */}
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-500">Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase hover:text-blue-800 transition-colors"
                >
                  <CheckCheck size={12} /> Tout marquer comme lu
                </button>
              )}
            </div>

            {/* LISTE DES NOTIFICATIONS */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                   <p className="text-slate-300 italic text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link 
                    key={notif.id} 
                    href={notif.link || "#"}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={`block p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-blue-50/20' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 p-2 bg-white border border-slate-100 rounded-lg shadow-sm h-fit ${!notif.isRead ? 'border-blue-100' : ''}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs ${!notif.isRead ? 'font-black text-slate-900' : 'font-medium text-slate-600'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-[9px] text-slate-300 mt-2 font-bold uppercase tracking-tighter">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* FOOTER : LIEN VERS HISTORIQUE */}
            <Link 
              href="/notifications" 
              onClick={() => setIsOpen(false)}
              className="block p-4 text-center text-[10px] font-black uppercase text-slate-400 bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2 border-t border-slate-50"
            >
              Voir tout l&apos;historique <ArrowRight size={12} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}