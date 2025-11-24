import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DisputeCardProps {
  dispute: any;
  onClick: () => void;
}

export function DisputeCard({ dispute, onClick }: DisputeCardProps) {
  const statusColors = {
    open: 'bg-blue-500',
    under_review: 'bg-yellow-500',
    escalated: 'bg-red-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500'
  };

  const typeLabels = {
    payout: 'Payout Issue',
    licensing: 'Licensing Conflict',
    copyright: 'Copyright Claim',
    refund: 'Refund Request',
    other: 'Other'
  };

  const StatusIcon = {
    open: Clock,
    under_review: AlertCircle,
    escalated: AlertCircle,
    resolved: CheckCircle,
    closed: XCircle
  }[dispute.status];

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              <span className="font-mono text-sm text-muted-foreground">#{dispute.dispute_number}</span>
            </div>
            <h3 className="font-semibold">{dispute.subject}</h3>
          </div>
          <Badge className={statusColors[dispute.status as keyof typeof statusColors]}>
            {dispute.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{typeLabels[dispute.type as keyof typeof typeLabels]}</span>
            {dispute.amount && <span className="font-semibold">${dispute.amount}</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            Created {new Date(dispute.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
