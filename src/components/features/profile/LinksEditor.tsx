import { FiLink, FiPlus, FiTrash2 } from 'react-icons/fi';
import SectionCard from '../../ui/SectionCard';
import Button from '../../ui/Button';
import IconButton from '../../ui/IconButton';
import VisibilityToggle from '../../ui/VisibilityToggle';
import { maximumLinks } from '../../../constants/profile';
import type { LinkErrors, LinkFormItem } from '../../../types/profile';

interface LinksEditorProps {
  links: LinkFormItem[];
  errors?: Record<string, LinkErrors>;
  canAddLink: boolean;
  onAdd: () => void;
  onUpdate: (linkId: string, changes: Partial<LinkFormItem>) => void;
  onRemove: (linkId: string) => void;
}

function LinksEditor({ links, errors = {}, canAddLink, onAdd, onUpdate, onRemove }: LinksEditorProps) {
  return (
    <SectionCard
      title="Enlaces personales"
      description="Agrega tu portafolio, LinkedIn o GitHub para compartirlos en tu perfil."
      headerRight={
        <span className="font-code text-[11px] uppercase tracking-wider text-orbita-accent">
          {links.length} de {maximumLinks}
        </span>
      }
    >
      {links.length > 0 && (
        <div className="hidden gap-2 text-sm font-medium text-orbita-text sm:flex">
          <span className="w-40">
            Etiqueta <span className="text-orbita-error" aria-hidden="true">*</span>
          </span>
          <span className="flex-1">
            URL <span className="text-orbita-error" aria-hidden="true">*</span>
          </span>
        </div>
      )}

      {links.map((link) => {
        const linkErrors = errors[link.id] ?? {};
        return (
          <div key={link.id} className="flex flex-col gap-1">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                aria-label="Etiqueta del enlace"
                aria-required="true"
                value={link.text}
                onChange={(event) => onUpdate(link.id, { text: event.target.value })}
                placeholder="GitHub"
                maxLength={150}
                className={`h-11 w-full rounded-lg border bg-orbita-surface px-3 text-sm text-orbita-text placeholder:text-orbita-disabled focus:outline-none sm:w-40 ${
                  linkErrors.text ? 'border-orbita-error' : 'border-orbita-outline focus:border-orbita-accent'
                }`}
              />
              <div
                className={`flex flex-1 items-center gap-2 rounded-lg border bg-orbita-surface px-3 ${
                  linkErrors.url ? 'border-orbita-error' : 'border-orbita-outline focus-within:border-orbita-accent'
                }`}
              >
                <FiLink className="shrink-0 text-orbita-muted" aria-hidden="true" />
                <input
                  aria-label="URL del enlace"
                  aria-required="true"
                  value={link.url}
                  onChange={(event) => onUpdate(link.id, { url: event.target.value })}
                  placeholder="github.com/tu-usuario"
                  maxLength={300}
                  className="h-11 w-full bg-transparent text-sm text-orbita-text placeholder:text-orbita-disabled focus:outline-none"
                />
              </div>
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
            {(linkErrors.text || linkErrors.url) && (
              <p className="text-xs text-orbita-error">{[linkErrors.text, linkErrors.url].filter(Boolean).join(' ')}</p>
            )}
          </div>
        );
      })}

      <Button variant="dashed" isFullWidth onClick={onAdd} disabled={!canAddLink} leftIcon={<FiPlus />}>
        {canAddLink ? 'Agregar enlace' : 'Llegaste al máximo de enlaces'}
      </Button>
    </SectionCard>
  );
}

export default LinksEditor;
