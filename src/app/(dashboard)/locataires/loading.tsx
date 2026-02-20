// app/locataires/loading.tsx

import React from 'react'

export default function Loading() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse">
      {/* Skeleton pour le titre */}
      <div className="h-10 w-48 bg-gray-200 rounded mb-8"></div>
      
      {/* Skeleton pour le tableau */}
      <div className="bg-gray-100 h-64 rounded-xl"></div>
    </div>
  )
}