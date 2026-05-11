import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({ className = "", size = 'md', showText = true, textClassName = "" }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string>("/img1234.svg");

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().logoDataUrl) {
        setLogoUrl(docSnap.data().logoDataUrl);
      } else {
        setLogoUrl("/img1234.svg");
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/global");
    });

    return () => unsubscribe();
  }, []);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden`}>
        <img 
          src={logoUrl} 
          alt="Site Logo" 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback if image not found
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">7</div>';
          }}
        />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-white tracking-tighter ${textClassName}`}>
          VORTEX
        </span>
      )}
    </div>
  );
}
