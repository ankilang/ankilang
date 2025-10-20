import { useState } from 'react'
import { translate } from '../services/deepl'

export default function TranslateDemo() {
  const [text, setText] = useState('Hello world')
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)

  const go = async () => {
    setLoading(true)
    const r = await translate(text, 'fr')
    if (r.success) {
      const item = Array.isArray(r.result) ? (r.result[0] ?? null) : r.result
      setOut(item ? item.translated : '')
    } else {
      setOut(`Erreur: ${r.error}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
      <textarea rows={3} value={text} onChange={e => { setText(e.target.value); }} />
      <button onClick={go} disabled={loading}>{loading ? 'Traduction…' : 'Traduire'}</button>
      <pre>{out}</pre>
    </div>
  )
}
