import Badge from '../ui/Badge'

const tones = {
  pending: 'amber',
  processing: 'brand',
  shipped: 'brand',
  delivered: 'green',
  cancelled: 'red',
  paid: 'green',
  failed: 'red',
  refunded: 'slate',
}

export default function OrderStatusBadge({ status }) {
  return <Badge tone={tones[status] || 'slate'} className="capitalize">{status}</Badge>
}
