// Mock utilitaire pour la gestion Pro
export const isPro = false // Mock : utilisateur non-Pro par défaut

export const guardPro = (callback: () => void, navigate: (path: string) => void) => {
  if (isPro) {
    callback()
  } else {
    navigate('/abonnement')
  }
}

export const getProStatus = () => isPro
