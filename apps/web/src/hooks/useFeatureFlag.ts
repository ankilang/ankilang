import { useMemo } from 'react'
import { FLAGS } from '../config/flags'

/**
 * Simple helper pour activer un flag en local sans déployer:
 * - .env.local: VITE_FEATURE_NEW_CARD_MODAL_V2=true
 * - ou localStorage: feature:newCardModalV2 = '1'
 * - ou query param: ?modalV2=1
 */
export function useFeatureFlag(name: 'newCardModalV2'): boolean {
  return useMemo(() => {
    if (name === 'newCardModalV2') {
      const env = FLAGS.FEATURE_NEW_CARD_MODAL_V2
      const ls = typeof window !== 'undefined' ? window.localStorage.getItem('feature:newCardModalV2') === '1' : false
      const qp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('modalV2') === '1' : false
      return Boolean(env || ls || qp)
    }
    return false
  }, [name])
}

