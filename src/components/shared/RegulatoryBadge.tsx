interface Props {
  size?: 'sm' | 'md'
}

export function RegulatoryBadge({ size = 'md' }: Props) {
  const sizeClasses = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <span className={`${sizeClasses}`} title="Obrigação regulatória">
      🏥
    </span>
  )
}
