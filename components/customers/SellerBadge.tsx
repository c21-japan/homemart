import { Badge } from '@/components/ui/Badge';

interface SellerBadgeProps {
  type: '買取' | '仲介';
  size?: 'sm' | 'default' | 'lg';
}

export function SellerBadge({ type, size = 'default' }: SellerBadgeProps) {
  const variant = type === '買取' ? 'destructive' : 'default';
  
  return (
    <Badge variant={variant} size={size}>
      {type}
    </Badge>
  );
}
