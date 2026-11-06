import { FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import ActionButton from '../../ui/ActionButton';
import IconButton from '../../ui/IconButton';
import VisibilityToggle from '../../ui/VisibilityToggle';
import { maximumLinks } from '../../../constants/profile';
import { fieldBoxClassName, getFieldBorderClassName } from '../../../utils/fieldClassNames';
import type { LinkErrors, LinkFormItem } from '../../../types/profile';

interface LinksEditorProps {
  links: LinkFormItem[];
  errors?: Record<string, LinkErrors>;
  canAddLink: boolean;
  onAdd: () => void;
  onUpdate: (linkId: string, changes: Partial<LinkFormItem>) => void;
  onRemove: (linkId: string) => void;
}

function RequiredMark() {
  return (
    <span className="ml-0.5 text-ui-mint" aria-hidden="true">
      *
    </span>
  );
}

function LinksEditor({ links, errors = {}, canAddLink, onAdd, onUpdate, onRemove }: LinksEditorProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-medium text-ui-text">Enlaces personales</h3>
        <span className="text-[10px] text-ui-moss">
          {links.length} de {maximumLinks}
        </span>
      </div>

      {links.length > 0 && (
        <div className="hidden gap-3 text-xs font-medium text-ui-text sm:flex">
          <span className="w-44">
            Nombre del enlace
            <RequiredMark />
          </span>
          <span className="flex-1">
            URL
            <RequiredMark />
          </span>
        </div>
      )}

      {links.map((link) => {
        const linkErrors = errors[link.id] ?? {};
        return (
          <div key={link.id} className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                aria-label="Nombre del enlace"
                aria-required="true"
                value={link.text}
                onChange={(event) => onUpdate(link.id, { text: event.target.value })}
                placeholder="Portafolio"
                maxLength={150}
                className={`w-full sm:w-44 ${fieldBoxClassName} ${getFieldBorderClassName(Boolean(linkErrors.text))}`}
              />
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <input
                  aria-label="URL del enlace"
                  aria-required="true"
                  value={link.url}
                  onChange={(event) => onUpdate(link.id, { url: event.target.value })}
                  placeholder="https://tu-sitio.dev"
                  maxLength={300}
                  className={`w-full min-w-0 ${fieldBoxClassName} ${getFieldBorderClassName(Boolean(linkErrors.url))}`}
                />
                <VisibilityToggle
                  isVisible={link.visibility}
                  onToggle={() => onUpdate(link.id, { visibility: !link.visibility })}
                />
                <IconButton
                  label="Eliminar enlace"
                  icon={<FiTrash2 />}
                  onClick={() => onRemove(link.id)}
                  variant="danger"
                  size="medium"
                />
              </div>
            </div>
            {(linkErrors.text || linkErrors.url) && (
              <p className="text-[11px] text-ui-danger">{[linkErrors.text, linkErrors.url].filter(Boolean).join(' ')}</p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActionButton variant="link" onClick={onAdd} disabled={!canAddLink} leftIcon={<FiPlus />}>
          {canAddLink ? 'Agregar enlace' : 'Llegaste al máximo de enlaces'}
        </ActionButton>
        <span className="flex items-center gap-1.5 text-[9px] text-ui-moss">
          <FiEye aria-hidden="true" />
          Usa el ojo para mostrar u ocultar cada enlace en tu perfil.
        </span>
      </div>
    </section>
  );
}

export default LinksEditor;
