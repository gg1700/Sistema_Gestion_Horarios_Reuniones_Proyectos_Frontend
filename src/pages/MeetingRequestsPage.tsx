
import { useState } from 'react';
import { NavLink } from 'react-router';
import { FiRefreshCw } from 'react-icons/fi';
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
    updateMeetingRequest,
} from '../api/meetingRequestsApi';
import { Dialog } from '../components/modals';
import { Input, Textarea } from '../components/ui';
import type { UpdateMeetingRequestPayload } from '../types/meetingRequests';

const PAGE_LIMIT = 20;

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
    }
}

function formatRequestSchedule(request: MeetingRequestItem) {
    const timeZone = request.timeZone || 'America/La_Paz';

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

function getCounterpartName(request: MeetingRequestItem) {
    return (
        `${request.name} ${request.firstSurname}`.trim()
        || request.handleName
        || 'Invitado'
    );
}

export default function MeetingRequestsPage() {
    const [action, setAction] =
        useState<MeetingRequestAction>('received');

    const [status, setStatus] =
        useState<MeetingRequestStatus | ''>('');

    const [page, setPage] = useState(1);
    const [decidingId, setDecidingId] = useState<string | null>(null);
    const [decisionError, setDecisionError] = useState('');
    const [decisionMessage, setDecisionMessage] = useState('');

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
    ) {
        if (decidingId) {
            return;
        }

        try {
            setDecidingId(request.id);
            setDecisionError('');
            setDecisionMessage('');

            await decideMeetingRequest(request.id, {
                decision,
            });

            setDecisionMessage(
                decision === 'accepted'
                    ? 'Solicitud aceptada. La reunión se ha confirmado.'
                    : 'Solicitud rechazada.',
            );

            refresh();
        } catch (failure) {
            setDecisionError(
                failure instanceof Error
                    ? failure.message
                    : 'No se pudo resolver la solicitud.',
            );
        } finally {
            setDecidingId(null);
        }
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
        setCancelError('');
    }

    function closeCancelDialog() {
        if (cancelling) return;

        setCancellingRequest(null);
        setCancelError('');
    }

    async function confirmCancelRequest() {
        if (!cancellingRequest || cancelling) return;

        try {
            setCancelling(true);
            setCancelError('');

            await cancelMeetingRequest(cancellingRequest.id);

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

            <nav className="requests-tabs" aria-label="Secciones de solicitudes">
                <NavLink to={paths.requests} end>
                    Agendado
                </NavLink>

                <NavLink to={paths.changes}>
                    Cambios de horario
                </NavLink>
            </nav>

            <div className="meeting-requests-toolbar">
                {decisionError && (
                    <Alert tone="danger">
                        {decisionError}
                    </Alert>
                )}

                {decisionMessage && (
                    <p className="flow-copy" role="status">
                        {decisionMessage}
                    </p>
                )}
                <div
                    className="meeting-requests-direction"
                    role="group"
                    aria-label="Dirección de las solicitudes"
                >
                    <button
                        type="button"
                        className={action === 'received' ? 'is-active' : ''}
                        aria-pressed={action === 'received'}
                        onClick={() => changeAction('received')}
                    >
                        Recibidas
                    </button>

                    <button
                        type="button"
                        className={action === 'sent' ? 'is-active' : ''}
                        aria-pressed={action === 'sent'}
                        onClick={() => changeAction('sent')}
                    >
                        Enviadas
                    </button>
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
                        <option value="cancelled">Canceladas</option>
                    </Select>
                </div>

                <Button
                    variant="ghost"
                    size="small"
                    loading={loading}
                    leadingIcon={<FiRefreshCw />}
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

                                        {request.ownerResponseMessage && (
                                            <small className="meeting-request-response">
                                                Respuesta: {request.ownerResponseMessage}
                                            </small>
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
                                                {schedule.timeZone}
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
                                cell: request => {
                                    if (request.status !== 'pending') {
                                        return <span>—</span>;
                                    }

                                    if (action === 'sent') {
                                        return (
                                            <div className="meeting-request-actions">
                                                <Button
                                                    size="small"
                                                    variant="secondary"
                                                    onClick={() => openEditDialog(request)}
                                                >
                                                    Editar
                                                </Button>

                                                <Button
                                                    size="small"
                                                    variant="danger"
                                                    onClick={() => openCancelDialog(request)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="meeting-request-actions">
                                            <Button
                                                size="small"
                                                disabled={decidingId !== null}
                                                loading={decidingId === request.id}
                                                onClick={() =>
                                                    void resolveRequest(request, 'accepted')
                                                }
                                            >
                                                Aceptar
                                            </Button>

                                            <Button
                                                size="small"
                                                variant="danger"
                                                disabled={decidingId !== null}
                                                onClick={() =>
                                                    void resolveRequest(request, 'rejected')
                                                }
                                            >
                                                Rechazar
                                            </Button>
                                        </div>
                                    );
                                },
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
                            **Horario actual**

                            <small>
                                {formatRequestSchedule(editingRequest).date}
                                <br />
                                {formatRequestSchedule(editingRequest).range}
                                <br />
                                {editingRequest.timeZone}
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
                description="¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer."
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
                                {cancellingRequest.timeZone}
                            </small>
                        </div>
                    </div>
                )}
            </Dialog>
        </MemberShell>
    );
}