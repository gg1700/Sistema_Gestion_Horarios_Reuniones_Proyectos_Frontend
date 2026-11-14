
import { useState } from 'react';
import { FiVideo } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { Person, StatusDot, TextLink } from '../components/features/flows/FlowPrimitives';
import {
    Alert,
    Button,
    DataTable,
    EmptyState,
    SectionHeading,
    Select,
} from '../components/ui';
import { paths } from '../constants/paths';
import { useMeetingRequests } from '../hooks/useMeetingRequests';
import type {
    MeetingRequestAction,
    MeetingRequestItem,
    MeetingRequestStatus,
} from '../types/meetingRequests';
import {
    cancelMeetingRequest,
    decideMeetingRequest,
    proposeMeetingReschedule,
    respondToMeetingProposal,
    updateMeetingRequest,
} from '../api/meetingRequestsApi';
import { RescheduleDialog, type RescheduleSubmit } from '../components/features/requests/RescheduleDialog';
import { useMemberIdentity } from '../features/github/MemberIdentityContext';
import { Dialog } from '../components/modals';
import { Input, Textarea } from '../components/ui';
import type { UpdateMeetingRequestPayload } from '../types/meetingRequests';

const PAGE_LIMIT = 20;
const MIN_REASON_LENGTH = 5;

function viewerTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

function formatTimeZoneName(timeZone: string) {
    return timeZone.replace(/_/g, ' ');
}

function getStatusLabel(status: MeetingRequestStatus) {
    switch (status) {
        case 'pending':
            return 'Pendiente';
        case 'accepted':
            return 'Aceptada';
        case 'rejected':
            return 'Rechazada';
        case 'cancelled':
            return 'Cancelada';
        case 'reschedule_proposed':
            return 'Nuevo horario propuesto';
    }
}

function getStatusTone(
    status: MeetingRequestStatus
): 'success' | 'warning' | 'danger' | 'muted' {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'accepted':
            return 'success';
        case 'rejected':
            return 'danger';
        case 'cancelled':
            return 'muted';
        case 'reschedule_proposed':
            return 'warning';
    }
}

function formatScheduleIn(request: MeetingRequestItem, timeZone: string) {
    const start = new Date(request.startsAt);
    const end = new Date(request.endsAt);

    const date = new Intl.DateTimeFormat('es-BO', {
        timeZone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(start);

    const timeFormatter = new Intl.DateTimeFormat('es-BO', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });

    return {
        date,
        range: `${timeFormatter.format(start)} — ${timeFormatter.format(end)}`,
        timeZone,
    };
}

/**
 * Las horas se muestran siempre en la zona horaria de quien está viendo la
 * solicitud. Si la solicitud se registró en otra zona, también se indica la
 * hora original para evitar confusiones entre países.
 */
function formatRequestSchedule(request: MeetingRequestItem) {
    const local = formatScheduleIn(request, viewerTimeZone());
    const originalZone = request.timeZone || local.timeZone;
    const original = originalZone !== local.timeZone
        ? formatScheduleIn(request, originalZone)
        : null;
    const differs = original !== null
        && (original.range !== local.range || original.date !== local.date);

    return {
        ...local,
        zoneLabel: `Tu hora local (${formatTimeZoneName(local.timeZone)})`,
        original: differs && original
            ? `${original.date}, ${original.range} en ${formatTimeZoneName(original.timeZone)}`
            : null,
    };
}

function formatProposal(request: MeetingRequestItem) {
    if (!request.proposedStartsAt || !request.proposedEndsAt) return null;
    return formatScheduleIn({
        ...request,
        startsAt: request.proposedStartsAt,
        endsAt: request.proposedEndsAt,
    }, viewerTimeZone());
}

function requestDuration(request: MeetingRequestItem) {
    return Math.max(Date.parse(request.endsAt) - Date.parse(request.startsAt), 15 * 60_000);
}

function getRejectionReason(request: MeetingRequestItem) {
    return request.status === 'rejected' ? request.ownerResponseMessage : null;
}

function formatRequestCreatedAt(createdAt: string) {
    return new Intl.DateTimeFormat('es-BO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: viewerTimeZone(),
    }).format(new Date(createdAt));
}

function getCounterpartName(request: MeetingRequestItem) {
    return (
        `${request.name} ${request.firstSurname}`.trim()
        || request.handleName
        || 'Invitado'
    );
}

type RescheduleMode = 'propose' | 'counter';

export default function MeetingRequestsPage() {
    const member = useMemberIdentity();
    const [action, setAction] =
        useState<MeetingRequestAction>('received');

    const [status, setStatus] =
        useState<MeetingRequestStatus | ''>('');

    const [page, setPage] = useState(1);
    const [decidingId, setDecidingId] = useState<string | null>(null);
    const [decisionError, setDecisionError] = useState('');
    const [decisionMessage, setDecisionMessage] = useState('');

    const [viewingRequest, setViewingRequest] =
        useState<MeetingRequestItem | null>(null);

    const [editingRequest, setEditingRequest] =
        useState<MeetingRequestItem | null>(null);

    const [editTitle, setEditTitle] = useState('');
    const [editMessage, setEditMessage] = useState('');

    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState('');

    const [cancellingRequest, setCancellingRequest] =
        useState<MeetingRequestItem | null>(null);

    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    const [rejectingRequest, setRejectingRequest] =
        useState<MeetingRequestItem | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectError, setRejectError] = useState('');

    const [rescheduling, setRescheduling] =
        useState<{ request: MeetingRequestItem; mode: RescheduleMode } | null>(null);
    const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null);

    const {
        requests,
        loading,
        error,
        refresh,
    } = useMeetingRequests(
        action,
        status || undefined,
        page,
        PAGE_LIMIT
    );

    function changeAction(nextAction: MeetingRequestAction) {
        setAction(nextAction);
        setPage(1);
    }

    function changeStatus(nextStatus: string) {
        setStatus(nextStatus as MeetingRequestStatus | '');
        setPage(1);
    }

    async function resolveRequest(
        request: MeetingRequestItem,
        decision: 'accepted' | 'rejected',
        responseMessage?: string,
    ) {
        if (decidingId) {
            return;
        }

        try {
            setDecidingId(request.id);
            setDecisionError('');
            setDecisionMessage('');

            const resolved = await decideMeetingRequest(request.id, {
                decision,
                ...(responseMessage ? { responseMessage } : {}),
            });

            setDecisionMessage(
                decision === 'accepted'
                    ? resolved.meetUrl
                        ? 'Solicitud aceptada. La reunión y su enlace de Google Meet ya están en la agenda.'
                        : 'Solicitud aceptada. La reunión se ha confirmado.'
                    : 'Solicitud rechazada. Se notificó el motivo al solicitante.',
            );

            setViewingRequest(null);
            setRejectingRequest(null);
            refresh();
        } catch (failure) {
            const message = failure instanceof Error
                ? failure.message
                : 'No se pudo resolver la solicitud.';
            if (decision === 'rejected') setRejectError(message);
            else setDecisionError(message);
        } finally {
            setDecidingId(null);
        }
    }

    function openReschedule(request: MeetingRequestItem, mode: RescheduleMode) {
        setViewingRequest(null);
        setDecisionError('');
        setRescheduling({ request, mode });
    }

    async function submitReschedule(choice: RescheduleSubmit) {
        if (!rescheduling) return;
        const { request, mode } = rescheduling;
        const result = mode === 'propose'
            ? await proposeMeetingReschedule(request.id, choice)
            : await respondToMeetingProposal(request.id, {
                decision: 'counter',
                startsAt: choice.startsAt,
                endsAt: choice.endsAt,
                timeZone: viewerTimeZone(),
                ...(choice.message ? { message: choice.message } : {}),
            });
        setDecisionMessage(result.message.replace(/reunion/g, 'reunión').replace(/invitacion/g, 'invitación'));
        setRescheduling(null);
        refresh();
    }

    async function acceptProposal(request: MeetingRequestItem) {
        if (acceptingProposalId) return;
        try {
            setAcceptingProposalId(request.id);
            setDecisionError('');
            await respondToMeetingProposal(request.id, { decision: 'accepted' });
            setDecisionMessage('Aceptaste el nuevo horario. La reunión quedó confirmada con su enlace de Google Meet.');
            setViewingRequest(null);
            refresh();
        } catch (failure) {
            setDecisionError(failure instanceof Error ? failure.message : 'No se pudo aceptar el nuevo horario.');
        } finally {
            setAcceptingProposalId(null);
        }
    }

    function openRejectDialog(request: MeetingRequestItem) {
        setViewingRequest(null);
        setRejectingRequest(request);
        setRejectReason('');
        setRejectError('');
    }

    function closeRejectDialog() {
        if (decidingId) return;
        setRejectingRequest(null);
        setRejectError('');
    }

    function confirmReject() {
        if (!rejectingRequest) return;
        const reason = rejectReason.trim().replace(/\s+/g, ' ');
        if (reason.length < MIN_REASON_LENGTH) {
            setRejectError(`Indica el motivo del rechazo (mínimo ${MIN_REASON_LENGTH} caracteres).`);
            return;
        }
        void resolveRequest(rejectingRequest, 'rejected', reason);
    }

    function openEditDialog(request: MeetingRequestItem) {
        setEditingRequest(request);
        setEditTitle(request.title);
        setEditMessage(request.message ?? '');
        setEditError('');
    }

    function closeEditDialog() {
        if (savingEdit) return;

        setEditingRequest(null);
        setEditError('');
    }

    async function saveRequestChanges(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!editingRequest || savingEdit) return;

        const title = editTitle.trim();
        const message = editMessage.trim();

        if (!title) {
            setEditError('El título de la reunión es obligatorio.');
            return;
        }

        if (message.length > 0 && message.length < 10) {
            setEditError(
                'El mensaje debe tener al menos 10 caracteres o quedar vacío.',
            );
            return;
        }

        const payload: UpdateMeetingRequestPayload = {};

        if (title !== editingRequest.title) {
            payload.title = title;
        }

        if (message !== (editingRequest.message ?? '')) {
            payload.message = message;
        }

        if (Object.keys(payload).length === 0) {
            closeEditDialog();
            return;
        }

        try {
            setSavingEdit(true);
            setEditError('');

            await updateMeetingRequest(editingRequest.id, payload);

            setDecisionMessage('La solicitud se actualizó correctamente.');
            setEditingRequest(null);

            refresh();
        } catch (failure) {
            setEditError(
                failure instanceof Error
                    ? failure.message
                    : 'No se pudo actualizar la solicitud.',
            );
        } finally {
            setSavingEdit(false);
        }
    }

    function openCancelDialog(request: MeetingRequestItem) {
        setCancellingRequest(request);
        setCancelReason('');
        setCancelError('');
    }

    function closeCancelDialog() {
        if (cancelling) return;

        setCancellingRequest(null);
        setCancelError('');
    }

    async function confirmCancelRequest() {
        if (!cancellingRequest || cancelling) return;

        const reason = cancelReason.trim().replace(/\s+/g, ' ');
        if (reason.length < MIN_REASON_LENGTH) {
            setCancelError(`Indica el motivo de la cancelación (mínimo ${MIN_REASON_LENGTH} caracteres).`);
            return;
        }

        try {
            setCancelling(true);
            setCancelError('');

            await cancelMeetingRequest(cancellingRequest.id, reason);

            setDecisionMessage('La solicitud se canceló correctamente.');
            setCancellingRequest(null);

            refresh();
        } catch (failure) {
            setCancelError(
                failure instanceof Error
                    ? failure.message
                    : 'No se pudo cancelar la solicitud.',
            );
        } finally {
            setCancelling(false);
        }
    }

    const hasNextPage = requests.length === PAGE_LIMIT;

    const emptyTitle = status
        ? 'No hay solicitudes con este estado.'
        : action === 'received'
            ? 'No tienes solicitudes recibidas.'
            : 'Aún no has enviado solicitudes.';

    const emptyDescription = action === 'received'
        ? 'Cuando alguien solicite una reunión contigo, aparecerá aquí.'
        : 'Las solicitudes que envíes a otros usuarios aparecerán aquí.';

    return (
        <MemberShell>
            <SectionHeading
                title="Solicitudes de reunión"
                eyebrow="MI ESPACIO / SOLICITUDES"
                accentPeriod
                actions={
                    <TextLink to={paths.agenda}>
                        Ver agenda
                    </TextLink>
                }
            />

            {decisionError && (
                <Alert className="meeting-requests-alert" tone="danger" onDismiss={() => setDecisionError('')}>
                    {decisionError}
                </Alert>
            )}

            {decisionMessage && (
                <Alert className="meeting-requests-alert" tone="success" onDismiss={() => setDecisionMessage('')}>
                    {decisionMessage}
                </Alert>
            )}

            <div className="meeting-requests-toolbar">
                <div
                    className="meeting-requests-direction"
                    role="group"
                    aria-label="Dirección de las solicitudes"
                >
                    <Button
                        size="small"
                        variant={action === 'received' ? 'primary' : 'ghost'}
                        aria-pressed={action === 'received'}
                        onClick={() => changeAction('received')}
                    >
                        Recibidas
                    </Button>

                    <Button
                        size="small"
                        variant={action === 'sent' ? 'primary' : 'ghost'}
                        aria-pressed={action === 'sent'}
                        onClick={() => changeAction('sent')}
                    >
                        Enviadas
                    </Button>
                </div>

                <div className="meeting-requests-filters">
                    <Select
                        label="Filtrar por estado"
                        value={status}
                        onChange={event => changeStatus(event.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="accepted">Aceptadas</option>
                        <option value="rejected">Rechazadas</option>
                        <option value="reschedule_proposed">Con nuevo horario propuesto</option>
                        <option value="cancelled">Canceladas</option>
                    </Select>
                </div>

                <Button
                    variant="ghost"
                    size="small"
                    loading={loading}
                    onClick={refresh}
                >
                    Actualizar
                </Button>
            </div>

            {loading && (
                <p className="flow-copy" role="status">
                    Consultando solicitudes...
                </p>
            )}

            {error && (
                <Alert tone="danger">
                    <p>{error}</p>

                    <Button
                        size="small"
                        variant="secondary"
                        onClick={refresh}
                    >
                        Reintentar
                    </Button>
                </Alert>
            )}

            {!loading && !error && requests.length > 0 && (
                <>
                    <DataTable<MeetingRequestItem>
                        caption={
                            action === 'received'
                                ? 'Solicitudes recibidas'
                                : 'Solicitudes enviadas'
                        }
                        rows={requests}
                        getRowKey={request => request.id}
                        columns={[
                            {
                                id: 'person',
                                heading: 'PERSONA',
                                cell: request => (
                                    <Person
                                        name={getCounterpartName(request)}
                                        detail={
                                            request.guestEmail ??
                                            (request.handleName ? `@${request.handleName}` : '')
                                        }
                                        profilePicture={request.profilePicture}
                                    />
                                ),
                            },
                            {
                                id: 'title',
                                heading: 'REUNIÓN',
                                cell: request => (
                                    <div className="requests-table-title">
                                        <strong>{request.title}</strong>

                                        <small>
                                            {request.message || 'Sin mensaje adicional.'}
                                        </small>

                                        {request.status === 'reschedule_proposed' && formatProposal(request) && (
                                            <small className="meeting-request-response meeting-request-response--warning">
                                                Nuevo horario propuesto: {formatProposal(request)!.date}, {formatProposal(request)!.range}
                                            </small>
                                        )}

                                        {getRejectionReason(request) && (
                                            <small className="meeting-request-response meeting-request-response--danger">
                                                Motivo del rechazo: {getRejectionReason(request)}
                                            </small>
                                        )}

                                        {request.status !== 'rejected' && request.ownerResponseMessage && (
                                            <small className="meeting-request-response">
                                                Respuesta: {request.ownerResponseMessage}
                                            </small>
                                        )}

                                        {request.status === 'cancelled' && request.cancellationReason && (
                                            <small className="meeting-request-response meeting-request-response--muted">
                                                Motivo de la cancelación: {request.cancellationReason}
                                            </small>
                                        )}

                                        {request.meetUrl && (
                                            <a
                                                className="meeting-request-meet"
                                                href={request.meetUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <FiVideo aria-hidden="true" /> Unirse a Google Meet
                                            </a>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                id: 'time',
                                heading: 'HORARIO SOLICITADO',
                                cell: request => {
                                    const schedule = formatRequestSchedule(request);

                                    return (
                                        <div className="requests-table-time">
                                            {schedule.date}

                                            <small>
                                                {schedule.range}
                                                <br />
                                                {schedule.zoneLabel}
                                            </small>
                                        </div>
                                    );
                                },
                            },
                            {
                                id: 'status',
                                heading: 'ESTADO',
                                cell: request => (
                                    <StatusDot tone={getStatusTone(request.status)}>
                                        {getStatusLabel(request.status)}
                                    </StatusDot>
                                ),
                            },
                            {
                                id: 'actions',
                                heading: 'ACCIONES',
                                cell: request => (
                                    <Button
                                        size="small"
                                        variant="secondary"
                                        onClick={() => setViewingRequest(request)}
                                    >
                                        Ver detalle
                                    </Button>
                                ),
                            },
                        ]}
                    />

                    <div className="meeting-requests-pagination">
                        <Button
                            size="small"
                            variant="secondary"
                            disabled={loading || page === 1}
                            onClick={() => setPage(current => current - 1)}
                        >
                            Anterior
                        </Button>

                        <span>Página {page}</span>

                        <Button
                            size="small"
                            variant="secondary"
                            disabled={loading || !hasNextPage}
                            onClick={() => setPage(current => current + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>
                </>
            )}

            {!loading && !error && requests.length === 0 && (
                <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                />
            )}

            <Dialog
                open={editingRequest !== null}
                onOpenChange={open => {
                    if (!open) closeEditDialog();
                }}
                title="Editar solicitud."
                eyebrow="SOLICITUD DE REUNIÓN"
                description="Modifica los detalles de tu solicitud pendiente."
                size="medium"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            disabled={savingEdit}
                            onClick={closeEditDialog}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            form="edit-meeting-request-form"
                            loading={savingEdit}
                        >
                            Guardar cambios
                        </Button>
                    </>
                }
            >
                {editingRequest && (
                    <form
                        id="edit-meeting-request-form"
                        className="flow-form"
                        onSubmit={saveRequestChanges}
                    >
                        {editError && (
                            <Alert tone="danger">
                                {editError}
                            </Alert>
                        )}

                        <div className="requests-table-time">
                            <p className="ui-eyebrow">HORARIO ACTUAL</p>

                            <strong>{formatRequestSchedule(editingRequest).date}</strong>

                            <small>
                                {formatRequestSchedule(editingRequest).range}
                                <br />
                                {formatRequestSchedule(editingRequest).zoneLabel}
                            </small>
                        </div>

                        <Input
                            label="Título de la reunión"
                            value={editTitle}
                            onChange={event => setEditTitle(event.target.value)}
                            required
                            maxLength={150}
                        />

                        <Textarea
                            label="Mensaje adicional"
                            value={editMessage}
                            onChange={event => setEditMessage(event.target.value)}
                            placeholder="Escribe un mensaje para el destinatario..."
                            rows={4}
                            maxLength={2000}
                        />
                    </form>
                )}
            </Dialog>

            <Dialog
                open={cancellingRequest !== null}
                onOpenChange={open => {
                    if (!open) closeCancelDialog();
                }}
                title="Cancelar solicitud"
                eyebrow="SOLICITUD DE REUNIÓN"
                description="Indica por qué cancelas la solicitud. El motivo se mostrará al destinatario y no se puede deshacer."
                size="medium"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            disabled={cancelling}
                            onClick={closeCancelDialog}
                        >
                            Volver
                        </Button>

                        <Button
                            variant="danger"
                            loading={cancelling}
                            onClick={() => void confirmCancelRequest()}
                        >
                            Sí, cancelar solicitud
                        </Button>
                    </>
                }
            >
                {cancellingRequest && (
                    <div className="flow-form">
                        {cancelError && (
                            <Alert tone="danger">
                                {cancelError}
                            </Alert>
                        )}

                        <div className="requests-table-title">
                            <strong>{cancellingRequest.title}</strong>

                            <small>
                                {getCounterpartName(cancellingRequest)}
                            </small>
                        </div>

                        <div className="requests-table-time">
                            {formatRequestSchedule(cancellingRequest).date}

                            <small>
                                {formatRequestSchedule(cancellingRequest).range}
                                <br />
                                {formatRequestSchedule(cancellingRequest).zoneLabel}
                            </small>
                        </div>

                        <Textarea
                            label="Motivo de la cancelación"
                            value={cancelReason}
                            onChange={event => setCancelReason(event.target.value)}
                            placeholder="Por ejemplo: surgió un imprevisto y necesito reprogramar."
                            rows={3}
                            maxLength={2000}
                            minLength={MIN_REASON_LENGTH}
                            required
                            disabled={cancelling}
                        />
                    </div>
                )}
            </Dialog>

            <Dialog
                open={viewingRequest !== null}
                onOpenChange={open => {
                    if (!open && decidingId === null) {
                        setViewingRequest(null);
                    }
                }}
                title="Detalle de la solicitud"
                eyebrow="SOLICITUD DE REUNIÓN"
                description="Consulta toda la información relacionada con esta solicitud."
                size="large"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            disabled={
                                decidingId !== null ||
                                savingEdit ||
                                cancelling
                            }
                            onClick={() => setViewingRequest(null)}
                        >
                            Cerrar
                        </Button>

                        {viewingRequest?.status === 'pending' && action === 'received' && (
                            <>
                                <Button
                                    variant="ghost"
                                    disabled={decidingId !== null}
                                    onClick={() => openRejectDialog(viewingRequest)}
                                >
                                    Rechazar
                                </Button>

                                <Button
                                    variant="secondary"
                                    disabled={decidingId !== null || !member?.profile}
                                    onClick={() => openReschedule(viewingRequest, 'propose')}
                                >
                                    {viewingRequest.guestEmail ? 'Confirmar en otro horario' : 'Proponer otro horario'}
                                </Button>

                                <Button
                                    disabled={decidingId !== null}
                                    loading={decidingId === viewingRequest.id}
                                    onClick={() =>
                                        void resolveRequest(viewingRequest, 'accepted')
                                    }
                                >
                                    Aceptar
                                </Button>
                            </>
                        )}

                        {viewingRequest?.status === 'reschedule_proposed' && action === 'sent' && (
                            <>
                                <Button
                                    variant="ghost"
                                    disabled={acceptingProposalId !== null}
                                    onClick={() => {
                                        const request = viewingRequest;
                                        setViewingRequest(null);
                                        openCancelDialog(request);
                                    }}
                                >
                                    Cancelar solicitud
                                </Button>

                                <Button
                                    variant="secondary"
                                    disabled={acceptingProposalId !== null || !viewingRequest.handleName}
                                    onClick={() => openReschedule(viewingRequest, 'counter')}
                                >
                                    Proponer otro horario
                                </Button>

                                <Button
                                    loading={acceptingProposalId === viewingRequest.id}
                                    onClick={() => void acceptProposal(viewingRequest)}
                                >
                                    Aceptar nuevo horario
                                </Button>
                            </>
                        )}

                        {viewingRequest?.status === 'pending' && action === 'sent' && (
                            <>
                                <Button
                                    variant="danger"
                                    disabled={cancelling || savingEdit}
                                    onClick={() => {
                                        const request = viewingRequest;

                                        setViewingRequest(null);
                                        openCancelDialog(request);
                                    }}
                                >
                                    Cancelar solicitud
                                </Button>

                                <Button
                                    variant="secondary"
                                    disabled={cancelling || savingEdit}
                                    onClick={() => {
                                        const request = viewingRequest;

                                        setViewingRequest(null);
                                        openEditDialog(request);
                                    }}
                                >
                                    Editar solicitud
                                </Button>
                            </>
                        )}
                    </>
                }
            >
                {viewingRequest && (
                    <div className="flow-form">
                        {decisionError && (
                            <Alert tone="danger">
                                {decisionError}
                            </Alert>
                        )}

                        <div>
                            <p className="ui-eyebrow">
                                ESTADO DE LA SOLICITUD
                            </p>

                            <StatusDot tone={getStatusTone(viewingRequest.status)}>
                                {getStatusLabel(viewingRequest.status)}
                            </StatusDot>
                        </div>

                        <div className="requests-table-title">
                            <p className="ui-eyebrow">
                                REUNIÓN
                            </p>

                            <strong>{viewingRequest.title}</strong>

                            <small>
                                {viewingRequest.message || 'No se añadió un mensaje.'}
                            </small>
                        </div>

                        <div>
                            <p className="ui-eyebrow">
                                {action === 'received'
                                    ? 'PERSONA QUE ENVÍA LA SOLICITUD'
                                    : 'DESTINATARIO DE LA SOLICITUD'}
                            </p>

                            <Person
                                name={getCounterpartName(viewingRequest)}
                                detail={
                                    viewingRequest.guestEmail ??
                                    (viewingRequest.handleName
                                        ? `@${viewingRequest.handleName}`
                                        : '')
                                }
                                profilePicture={viewingRequest.profilePicture}
                            />
                        </div>

                        <div className="requests-table-time">
                            <p className="ui-eyebrow">
                                HORARIO SOLICITADO
                            </p>

                            <strong>
                                {formatRequestSchedule(viewingRequest).date}
                            </strong>

                            <small>
                                {formatRequestSchedule(viewingRequest).range}
                                <br />
                                {formatRequestSchedule(viewingRequest).zoneLabel}
                                {formatRequestSchedule(viewingRequest).original && (
                                    <>
                                        <br />
                                        Registrada como: {formatRequestSchedule(viewingRequest).original}
                                    </>
                                )}
                            </small>
                        </div>

                        <div className="requests-table-time">
                            <p className="ui-eyebrow">
                                FECHA DE ENVÍO
                            </p>

                            <small>
                                {formatRequestCreatedAt(viewingRequest.createdAt)}
                            </small>
                        </div>

                        {viewingRequest.resolvedAt && (
                            <div className="requests-table-time">
                                <p className="ui-eyebrow">
                                    FECHA DE RESOLUCIÓN
                                </p>

                                <small>
                                    {formatRequestCreatedAt(viewingRequest.resolvedAt)}
                                </small>
                            </div>
                        )}

                        {viewingRequest.status === 'reschedule_proposed' && formatProposal(viewingRequest) && (
                            <div className="meeting-request-proposal">
                                <p className="ui-eyebrow">
                                    {action === 'sent' ? 'NUEVO HORARIO PROPUESTO PARA TI' : 'NUEVO HORARIO QUE PROPUSISTE'}
                                </p>
                                <strong>{formatProposal(viewingRequest)!.date}</strong>
                                <span>{formatProposal(viewingRequest)!.range} · {formatRequestSchedule(viewingRequest).zoneLabel}</span>
                                {viewingRequest.proposalMessage && (
                                    <small>Mensaje: {viewingRequest.proposalMessage}</small>
                                )}
                                {action === 'received' && (
                                    <small>Esperando la respuesta del solicitante.</small>
                                )}
                            </div>
                        )}

                        {viewingRequest.meetUrl && (
                            <div className="requests-table-title">
                                <p className="ui-eyebrow">
                                    VIDEOLLAMADA
                                </p>

                                <a
                                    className="ui-button ui-button--secondary ui-button--small meeting-request-meet-button"
                                    href={viewingRequest.meetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Unirse a Google Meet
                                </a>
                            </div>
                        )}

                        {getRejectionReason(viewingRequest) && (
                            <Alert tone="danger">
                                <strong>Motivo del rechazo:</strong>{' '}
                                {getRejectionReason(viewingRequest)}
                            </Alert>
                        )}

                        {viewingRequest.status !== 'rejected' && viewingRequest.ownerResponseMessage && (
                            <div className="requests-table-title">
                                <p className="ui-eyebrow">
                                    RESPUESTA DEL DESTINATARIO
                                </p>

                                <small>
                                    {viewingRequest.ownerResponseMessage}
                                </small>
                            </div>
                        )}

                        {viewingRequest.status === 'cancelled' && viewingRequest.cancellationReason && (
                            <Alert tone="info">
                                <strong>Motivo de la cancelación:</strong>{' '}
                                {viewingRequest.cancellationReason}
                            </Alert>
                        )}

                        {viewingRequest.status === 'pending' && action === 'received' && (
                            <p className="flow-note">
                                {viewingRequest.guestEmail
                                    ? 'Si el horario no te conviene, confírmalo en otro horario: el visitante recibirá por correo la invitación de Google Calendar con el enlace de Meet.'
                                    : 'Si el horario no te conviene, propón otro: el solicitante podrá aceptarlo o sugerir uno distinto.'}
                                {' '}Al aceptar, la reunión se crea con enlace de Google Meet en tu calendario y en el del
                                solicitante si tiene Google Calendar conectado. Rechaza solo si no habrá reunión; deberás indicar un motivo.
                            </p>
                        )}

                        {viewingRequest.status === 'pending' && action === 'sent' && (
                            <p className="flow-note">
                                Esta solicitud todavía está pendiente de respuesta.
                                Puedes editarla o cancelarla desde el listado.
                            </p>
                        )}
                    </div>
                )}
            </Dialog>
            {rescheduling && (rescheduling.mode === 'propose' ? member?.profile?.handleName : rescheduling.request.handleName) && (
                <RescheduleDialog
                    handle={(rescheduling.mode === 'propose'
                        ? member!.profile!.handleName
                        : rescheduling.request.handleName)!}
                    durationMs={requestDuration(rescheduling.request)}
                    currentStartsAt={new Date(rescheduling.request.startsAt).toISOString()}
                    title={rescheduling.mode === 'propose'
                        ? (rescheduling.request.guestEmail ? 'Confirmar en otro horario' : 'Proponer otro horario')
                        : 'Proponer otro horario'}
                    description={rescheduling.mode === 'propose'
                        ? `Elige uno de tus horarios libres para «${rescheduling.request.title}».`
                        : `Elige otro horario libre de ${getCounterpartName(rescheduling.request)} para «${rescheduling.request.title}».`}
                    note={rescheduling.mode === 'propose'
                        ? (rescheduling.request.guestEmail
                            ? 'El visitante no tiene cuenta: la reunión se confirma en este horario y Google Calendar le enviará la invitación por correo para que la acepte o la rechace.'
                            : 'La solicitud quedará a la espera de que el solicitante acepte el nuevo horario o proponga otro.')
                        : 'La solicitud volverá a quedar pendiente hasta que el anfitrión la acepte.'}
                    submitLabel={rescheduling.mode === 'propose' && rescheduling.request.guestEmail
                        ? 'Confirmar reunión'
                        : 'Enviar propuesta'}
                    onClose={() => setRescheduling(null)}
                    onSubmit={submitReschedule}
                />
            )}

            <Dialog
                open={rejectingRequest !== null}
                onOpenChange={open => {
                    if (!open) closeRejectDialog();
                }}
                title="Rechazar solicitud"
                eyebrow="SOLICITUD DE REUNIÓN"
                description="Indica el motivo del rechazo. Se mostrará a la persona que envió la solicitud."
                size="medium"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            disabled={decidingId !== null}
                            onClick={closeRejectDialog}
                        >
                            Volver
                        </Button>

                        <Button
                            variant="danger"
                            loading={rejectingRequest !== null && decidingId === rejectingRequest.id}
                            onClick={confirmReject}
                        >
                            Rechazar solicitud
                        </Button>
                    </>
                }
            >
                {rejectingRequest && (
                    <div className="flow-form">
                        {rejectError && (
                            <Alert tone="danger">
                                {rejectError}
                            </Alert>
                        )}

                        <div className="requests-table-title">
                            <strong>{rejectingRequest.title}</strong>
                            <small>{getCounterpartName(rejectingRequest)}</small>
                        </div>

                        <div className="requests-table-time">
                            {formatRequestSchedule(rejectingRequest).date}
                            <small>
                                {formatRequestSchedule(rejectingRequest).range}
                                <br />
                                {formatRequestSchedule(rejectingRequest).zoneLabel}
                            </small>
                        </div>

                        <Textarea
                            label="Motivo del rechazo"
                            value={rejectReason}
                            onChange={event => setRejectReason(event.target.value)}
                            placeholder="Por ejemplo: ese día tengo otra reunión; ¿podrías proponer otro horario?"
                            rows={3}
                            maxLength={2000}
                            minLength={MIN_REASON_LENGTH}
                            required
                            disabled={decidingId !== null}
                        />
                    </div>
                )}
            </Dialog>
        </MemberShell>
    );
}