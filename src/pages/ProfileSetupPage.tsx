import { useNavigate, useSearchParams } from 'react-router';
import { FiArrowLeft, FiArrowRight, FiCheck, FiPlus, FiShield } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { OrbitalGraphic, Button } from '../components/ui';
import { Dialog } from '../components/modals';
import { ProfileForm } from '../components/features/profile/ProfileForm';
import { ExperienceEditor } from '../components/features/profile/ExperienceEditor';
import { WorkTimeline } from '../components/features/profile/ProfileParts';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths } from '../constants/paths';

/*
CONTRATOS DEL PRIMER INGRESO — SIN ENDPOINT ADICIONAL
Paso Información: GET /api/v1/profile y PATCH /api/v1/profile; JSON y validaciones en
ProfilePage.tsx y EditProfileDialog.tsx. Foto: contrato multipart de ProfileForm.tsx.
Paso Experiencia: POST/PATCH /api/v1/profile/work-experience, JSON en ExperienceEditor.tsx;
DELETE /api/v1/profile/work-experience/:id, sin body, respuesta 204.
Todos requieren sesión del titular. Avanzar tras confirmar el guardado; si falla,
conservar formulario y mostrar el error del campo. Omitir paso no envía cambios.
Cada alta/edición/eliminación de experiencia se guarda al efectuarla; el botón final
solo termina el recorrido y navega al perfil. Los pasos opcionales no bloquean la cuenta.
*/
export default function ProfileSetupPage() {
  const { state, dispatch } = useMockFlow();
  const [query, setQuery] = useSearchParams();
  const navigate = useNavigate();
  const workStep = query.get('paso') === 'experiencia';
  const editorId = query.get('experiencia');
  const experience = state.account.experiences.find(item => item.id === editorId);
  function showWork() { setQuery({ paso: 'experiencia' }); }
  return <MemberShell><div className="profile-setup-story"><p className="ui-eyebrow">TU CUENTA YA ESTÁ LISTA</p><h1>Un lugar para<br />todo lo que eres.</h1><p>Tu perfil es el punto de encuentro<br />entre tú y tus próximas conexiones.</p><OrbitalGraphic /><div><span>01 · TU PERFIL</span><span>02 · TUS CONEXIONES</span></div></div>
    <Dialog open onOpenChange={open => { if (!open) navigate(paths.profile); }} title={workStep ? 'Tu recorrido también conecta.' : 'Dale forma a tu perfil.'} description={workStep ? 'Agrega tus experiencias y revisa cómo quedarán en tu perfil.' : 'Agrega los datos con los que quieres presentarte.'} className="profile-setup-dialog" size="large"
      headerLeading={<div className="profile-stepper"><span className={!workStep ? 'is-current' : 'is-done'}>{workStep ? <FiCheck /> : '01'}</span>Información adicional<i /><span className={workStep ? 'is-current' : ''}>02</span>Experiencia laboral<small>Opcional</small></div>}
      footer={workStep ? <><Button variant="ghost" leadingIcon={<FiArrowLeft />} onClick={() => navigate(paths.profile)}>Completar más tarde</Button><Button onClick={() => navigate(paths.profile)} trailingIcon={<FiArrowRight />}>Guardar e ir a mi perfil</Button></> : <><Button variant="ghost" onClick={showWork}>Omitir este paso</Button><Button type="submit" form="additional-info" trailingIcon={<FiArrowRight />}>Guardar y continuar</Button></>}>
      {!workStep ? <ProfileForm id="additional-info" onSave={value => { dispatch({ type: 'account', action: { type: 'save-details', details: value.details } }); showWork(); }} /> : <div className="profile-work-step"><div className="profile-section-head"><h3>Tus experiencias</h3><small>{state.account.experiences.length} de 10 agregadas</small></div>
        <WorkTimeline experiences={state.account.experiences} onEdit={id => setQuery({ paso: 'experiencia', experiencia: id })} onRemove={id => dispatch({ type: 'account', action: { type: 'remove-experience', id } })} />
        <button type="button" className="flow-link" disabled={state.account.experiences.length >= 10} onClick={() => setQuery({ paso: 'experiencia', experiencia: 'nueva' })}><FiPlus />Agregar experiencia</button>
        <p className="flow-note flow-top-rule"><FiShield /><span>Esta información es opcional.<br />Puedes volver, hacer cambios o completar tu perfil más tarde.</span></p>
      </div>}
    </Dialog>
    {workStep && editorId && (experience || editorId === 'nueva') && <ExperienceEditor key={editorId} experience={experience} onClose={showWork} onSave={value => { dispatch({ type: 'account', action: { type: 'save-experience', experience: value } }); showWork(); }} />}
  </MemberShell>;
}
