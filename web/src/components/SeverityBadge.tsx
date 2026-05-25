interface SeverityBadgeProps {
  severity: string;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const severityLower = severity.toLowerCase();
  return <span className={`badge badge-${severityLower}`}>{severity}</span>;
}
