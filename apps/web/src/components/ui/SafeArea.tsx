import type { ReactNode } from 'react';
import { usePWAContext } from '../../contexts/PWAContext';

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  all?: boolean;
}

export default function SafeArea({ 
  children, 
  className = '', 
  top = false, 
  bottom = false, 
  left = false, 
  right = false, 
  all = false 
}: SafeAreaProps) {
  const { isInstalled } = usePWAContext();

  // Ne pas appliquer les safe areas si l'app n'est pas installée
  if (!isInstalled) {
    return <div className={className}>{children}</div>;
  }

  const safeAreaClasses = [];

  if (all) {
    safeAreaClasses.push('safe-area-all');
  } else {
    if (top) safeAreaClasses.push('pt-safe-area-inset-top');
    if (bottom) safeAreaClasses.push('pb-safe-area-inset-bottom');
    if (left) safeAreaClasses.push('pl-safe-area-inset-left');
    if (right) safeAreaClasses.push('pr-safe-area-inset-right');
  }

  return (
    <div className={`${safeAreaClasses.join(' ')} ${className}`}>
      {children}
    </div>
  );
}
