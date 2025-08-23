type BlobProps = { className?: string }

export default function Blob({ className = '' }: BlobProps) {
  return <div className={`da-blob ${className}`} aria-hidden="true" />
}
