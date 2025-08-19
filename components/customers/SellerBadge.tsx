import { Badge } from '@/components/ui/Badge';

interface SellerBadgeProps {
  type: '買取' | '仲介';
}

export function SellerBadge({ type }: SellerBadgeProps) {
  const variant = type === '買取' ? 'destructive' : 'default';
  
  return (
    <Badge variant={variant}>
      {type}
    </Badge>
  );
}
