import { FiShield } from 'react-icons/fi';

interface VerifiedAccountProps {
  email: string;
}

function VerifiedAccount({ email }: VerifiedAccountProps) {
  return (
    <div className="flex items-center gap-3.5 border-b border-[#2D4638] pb-5 text-[#C4DFCE]">
      <FiShield className="h-7 w-7 shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <strong className="truncate text-xs font-medium">{email}</strong>
        <span className="text-[10px] text-ui-moss">Identidad externa verificada</span>
      </div>
      <small className="ml-auto shrink-0 text-[10px] text-ui-moss">• &nbsp;Verificada</small>
    </div>
  );
}

export default VerifiedAccount;
