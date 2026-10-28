import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useSearchParams } from 'react-router';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { TextLink } from '../components/features/flows/FlowPrimitives';
import { Alert, ButtonLink } from '../components/ui';
import { paths } from '../constants/paths';

/*
CONTRATO BACKEND — RETORNO DE AUTORIZACIÓN NO COMPLETADA
Esta pantalla no necesita un GET propio ni envía datos para mostrar el aviso.
El callback del servidor redirige aquí con provider=google|github y, si era integración,
volver=conexiones. No poner tokens, correos ni mensajes internos del proveedor en la URL.
Reintentar acceso -> iniciar GET /api/v1/auth/:provider con intent=login (AccessPage.tsx).
Volver a conexiones -> /perfil/conexiones para reabrir la autorización correspondiente.
Solo aceptar destinos internos previstos; nunca una URL de retorno arbitraria.
*/
export default function AccessIssuePage() {
  const [query] = useSearchParams();
  const returnTo = query.get('volver') === 'conexiones' ? paths.connections : paths.access;
  const reasons: Record<string, string> = {
    email_conflict: 'Ya existe un perfil con ese correo. Entra con una cuenta que ya tengas vinculada y agrega la segunda desde Conexiones.',
    account_conflict: 'Esta cuenta externa ya está vinculada a otro perfil. No se cambió su propietario ni se fusionaron tus perfiles.',
    additional_info_required: 'La cuenta de GitHub necesita un correo verificado para crear tu perfil. Comprueba tus correos en GitHub y vuelve a intentar.',
  };
  const reason = reasons[query.get('reason') ?? ''];

  return <VisitorShell access><section className="access-issue"><OrbitIllustration /><p className="ui-eyebrow">AUTORIZACIÓN EXTERNA</p><h1>El acceso no se completó<span>.</span></h1><p>La autorización del proveedor no se completó. Vuelve a intentarlo con Google o GitHub.</p>{reason && <Alert tone="warning">{reason}</Alert>}<div><ButtonLink to={returnTo} trailingIcon={<FiArrowRight />}>Reintentar acceso</ButtonLink><TextLink to={paths.home} icon={<FiArrowLeft />}>Volver a Orbitia</TextLink></div></section></VisitorShell>;
}
