import { FiShield } from 'react-icons/fi';

function SecurityNotice() {
  return (
    <div className="mt-4 flex gap-3 rounded-lg border border-orbita-outline bg-orbita-card p-4">
      <FiShield className="mt-0.5 shrink-0 text-orbita-primary" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-orbita-text">Tus datos están protegidos</p>
        <p className="mt-1 text-xs leading-5 text-orbita-muted">
          La contraseña se guarda cifrada y nunca se comparte con otros servicios.
        </p>
      </div>
    </div>
  );
}

export default SecurityNotice;
