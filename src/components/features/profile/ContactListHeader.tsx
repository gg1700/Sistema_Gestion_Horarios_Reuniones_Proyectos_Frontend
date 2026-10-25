interface ContactListHeaderProps {
  label: string;
  count: number;
  maximum: number;
}

function ContactListHeader({ label, count, maximum }: ContactListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-orbita-text">{label}</span>
      <span className="font-code text-[11px] uppercase tracking-wider text-orbita-muted">
        {count} de {maximum}
      </span>
    </div>
  );
}

export default ContactListHeader;
