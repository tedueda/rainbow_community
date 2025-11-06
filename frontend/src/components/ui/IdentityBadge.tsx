import { Badge } from './badge';

interface IdentityBadgeProps {
  value?: string | null;
}

export function IdentityBadge({ value }: IdentityBadgeProps) {
  if (!value) return null;

  const identityMap: Record<string, { label: string; className: string }> = {
    gay: { label: 'ゲイ', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    lesbian: { label: 'レズビアン', className: 'bg-pink-100 text-pink-700 border-pink-300' },
    bisexual: { label: 'バイセクシュアル', className: 'bg-purple-100 text-purple-700 border-purple-300' },
    transgender: { label: 'トランスジェンダー', className: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    queer: { label: 'クィア', className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    nonbinary: { label: 'ノンバイナリー', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    pansexual: { label: 'パンセクシュアル', className: 'bg-rose-100 text-rose-700 border-rose-300' },
    asexual: { label: 'アセクシュアル', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    other: { label: 'その他', className: 'bg-green-100 text-green-700 border-green-300' }
  };

  const identity = identityMap[value.toLowerCase()] || { 
    label: value, 
    className: 'bg-gray-100 text-gray-700 border-gray-300' 
  };

  return (
    <Badge variant="outline" className={`text-xs ${identity.className}`}>
      {identity.label}
    </Badge>
  );
}
