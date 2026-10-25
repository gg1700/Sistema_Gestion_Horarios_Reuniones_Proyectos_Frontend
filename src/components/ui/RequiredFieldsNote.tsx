interface RequiredFieldsNoteProps {
  condition?: string;
}

function RequiredFieldsNote({ condition }: RequiredFieldsNoteProps) {
  return (
    <p className="text-xs text-orbita-muted">
      {condition ? `${condition}, los` : 'Los'} campos con <span className="text-orbita-error">*</span> son
      obligatorios.
    </p>
  );
}

export default RequiredFieldsNote;
