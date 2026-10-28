interface RequiredFieldsNoteProps {
  condition?: string;
}

function RequiredFieldsNote({ condition }: RequiredFieldsNoteProps) {
  return (
    <p className="text-[11px] text-ui-muted">
      {condition ? `${condition}, los` : 'Los'} campos con <span className="text-ui-mint">*</span> son obligatorios.
    </p>
  );
}

export default RequiredFieldsNote;
