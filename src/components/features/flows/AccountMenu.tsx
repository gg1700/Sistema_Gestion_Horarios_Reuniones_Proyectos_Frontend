
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  FiEye,
  FiLink,
  FiLogOut,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { paths } from '../../../constants/paths';
import { TextLink } from './FlowPrimitives';
import { useMemberIdentity } from '../../../features/github/MemberIdentityContext';
import { useUI } from '../../../contexts/UIContext';

export function AccountMenu({
  onClose,
}: {
  onClose: () => void;
}) {
  const member = useMemberIdentity();
  const { notify } = useUI();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;

    ref.current
      ?.querySelector<HTMLButtonElement>('button')
      ?.focus();

    const pointer = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('.ui-header__identity')
      ) {
        return;
      }

      if (!ref.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        previous?.focus();
      }
    };

    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', keyboard);

    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', keyboard);
    };
  }, [onClose]);

  if (!member?.profile) return null;

  const profile = member.profile;

  async function logout() {
    try {
      await member!.signOut();
      onClose();
      navigate(paths.home);
    } catch (failure) {
      notify(
        failure instanceof Error
          ? failure.message
          : 'No se pudo cerrar sesión.',
        'danger'
      );
    }
  }

  return (
    <div
      className="flow-account-menu"
      ref={ref}
      role="dialog"
      aria-label="Menú de cuenta"
    >
      <header>
        <div>
          <strong>
            {profile.name} {profile.firstSurname}
          </strong>
          <span>{profile.email}</span>
        </div>

        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
        >
          <FiX />
        </button>
      </header>

      <div className="flow-account-menu__links">
        <TextLink
          to={paths.profile}
          icon={null}
          onClick={onClose}
        >
          <FiUser />
          Mi perfil
        </TextLink>

        <TextLink
          to={paths.connections}
          icon={null}
          onClick={onClose}
        >
          <FiLink />
          Conexiones
        </TextLink>

        <TextLink
          to={paths.visibility}
          icon={null}
          onClick={onClose}
        >
          <FiEye />
          Visibilidad
        </TextLink>
      </div>

      <button
        type="button"
        className="flow-account-menu__logout"
        onClick={() => void logout()}
      >
        <FiLogOut />
        Cerrar sesión
      </button>
    </div>
  );
}