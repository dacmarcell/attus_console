interface Props {
  severity: string;
}

export default function SeverityBadge({ severity }: Props) {
  const severityLower = severity.toLowerCase();
  return <span className={`badge badge-${severityLower}`}>{severity}</span>;
}
