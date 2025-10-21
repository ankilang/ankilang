/**
 * @deprecated Ce composant n'est plus utilisé depuis la suppression du système Premium.
 * Conservé temporairement pour référence historique.
 */
// Imports supprimés car plus utilisés

interface ProOnlyProps {
  children: React.ReactNode
}

export default function ProOnly({ children }: ProOnlyProps) {
  // Plus de distinction de plan - toujours afficher le contenu
  return <>{children}</>
}

