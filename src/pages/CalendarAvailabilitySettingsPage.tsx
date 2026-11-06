import { useEffect, useState } from 'react';
import { FiCalendar, FiCheck, FiCopy, FiPlus, FiTrash2 } from 'react-icons/fi';

import { MemberShell } from '../components/features/flows/FlowShell';
import { ProfileTabs } from '../components/features/profile/ProfileParts';
import { Alert, Button, SectionHeading } from '../components/ui';

import { useUI } from '../contexts/UIContext';

import {
    getAvailabilityRules,
    getPublicCalendarLink,
    replaceAvailabilityRules,
    updatePublicCalendarLink,
} from '../api/calendarAvailabilityApi';

import type {
    AvailabilityRule,
    PublicCalendarLink,
} from '../types/calendarAvailability';

const weekDays = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];

interface RuleDraft extends AvailabilityRule {
    draftId: string;
}

function createRuleDraft(
    rule: AvailabilityRule,
    index: number,
): RuleDraft {
    return {
        ...rule,
        draftId: rule.id ?? `draft-${rule.dayOfWeek}-${index}`,
    };
}

export default function CalendarAvailabilitySettingsPage() {
    const { notify } = useUI();

    const [timeZone, setTimeZone] = useState('America/La_Paz');
    const [rules, setRules] = useState<RuleDraft[]>([]);
    const [publicLink, setPublicLink] =
        useState<PublicCalendarLink | null>(null);

    const [loading, setLoading] = useState(true);
    const [savingRules, setSavingRules] = useState(false);
    const [updatingLink, setUpdatingLink] = useState(false);

    const [error, setError] = useState('');
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadSettings() {
            setLoading(true);
            setError('');

            try {
                const [availability, link] = await Promise.all([
                    getAvailabilityRules(),
                    getPublicCalendarLink(),
                ]);

                if (!active) {
                    return;
                }

                setTimeZone(availability.timeZone);
                setRules(
                    availability.rules.map((rule, index) =>
                        createRuleDraft(rule, index),
                    ),
                );
                setPublicLink(link);
                setDirty(false);
            } catch (failure) {
                if (active) {
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : 'No se pudo cargar tu configuración.',
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadSettings();

        return () => {
            active = false;
        };
    }, []);

    function updateRule(
        draftId: string,
        changes: Partial<AvailabilityRule>,
    ) {
        setRules(current =>
            current.map(rule =>
                rule.draftId === draftId
                    ? { ...rule, ...changes }
                    : rule,
            ),
        );

        setDirty(true);
    }

    function addRule(dayOfWeek: number) {
        const draftId = `new-${Date.now()}-${Math.random()}`;

        setRules(current => [
            ...current,
            {
                draftId,
                dayOfWeek,
                startTime: '09:00',
                endTime: '17:00',
                active: true,
            },
        ]);

        setDirty(true);
    }

    function removeRule(draftId: string) {
        setRules(current =>
            current.filter(rule => rule.draftId !== draftId),
        );

        setDirty(true);
    }

    async function saveRules() {
        if (savingRules) {
            return;
        }

        try {
            setSavingRules(true);
            setError('');

            const response = await replaceAvailabilityRules({
                timeZone: timeZone.trim(),
                rules: rules.map(rule => ({
                    dayOfWeek: rule.dayOfWeek,
                    startTime: rule.startTime,
                    endTime: rule.endTime,
                    active: rule.active,
                })),
            });

            setTimeZone(response.timeZone);
            setRules(
                response.rules.map((rule, index) =>
                    createRuleDraft(rule, index),
                ),
            );

            setDirty(false);
            notify('Disponibilidad guardada correctamente.', 'success');
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : 'No se pudo guardar la disponibilidad.',
            );
        } finally {
            setSavingRules(false);
        }
    }

    async function togglePublicLink() {
        if (!publicLink || updatingLink) {
            return;
        }

        const nextActive = !publicLink.active;
        if (nextActive && dirty) {
            setError('Guarda primero los cambios de disponibilidad.');
            return;
        }

        if (
            nextActive &&
            !rules.some(rule => rule.active)
        ) {
            setError(
                'Primero configura y guarda al menos un horario activo.',
            );
            return;
        }

        try {
            setUpdatingLink(true);
            setError('');

            const result = await updatePublicCalendarLink(nextActive);

            setPublicLink(result);

            notify(
                nextActive
                    ? 'Tu calendario público está activo.'
                    : 'Tu calendario público está desactivado.',
                'success',
            );
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : 'No se pudo actualizar el enlace público.',
            );
        } finally {
            setUpdatingLink(false);
        }
    }

    async function copyLink() {
        if (!publicLink?.url) {
            return;
        }

        try {
            await navigator.clipboard.writeText(publicLink.url);
            notify('Enlace copiado.', 'success');
        } catch {
            setError('No se pudo copiar el enlace.');
        }
    }

    const activeRulesCount = rules.filter(rule => rule.active).length;

    return (
        <MemberShell>
            <SectionHeading
                title="Organiza cuándo estás disponible"
                eyebrow="MI CUENTA / CALENDARIO"
                accentPeriod
            />

            <ProfileTabs />

            {error && (
                <Alert tone="danger">
                    {error}
                </Alert>
            )}

            {loading && (
                <p className="flow-copy" role="status">
                    Cargando configuración del calendario...
                </p>
            )}

            {!loading && (
                <div className="calendar-settings">
                    <section className="calendar-settings-main">
                        <header className="calendar-settings-heading">
                            <div>
                                <p className="ui-eyebrow">HORARIOS SEMANALES</p>
                                <h2>Define tus horas disponibles.</h2>
                                <p>
                                    Los visitantes podrán solicitar reuniones únicamente
                                    dentro de estos intervalos.
                                </p>
                            </div>

                            <FiCalendar />
                        </header>

                        <div className="calendar-settings-timezone">
                            <label htmlFor="availability-timezone">
                                Zona horaria del calendario
                            </label>

                            <input
                                id="availability-timezone"
                                type="text"
                                value={timeZone}
                                placeholder="America/La_Paz"
                                onChange={event => {
                                    setTimeZone(event.target.value);
                                    setDirty(true);
                                }}
                            />

                            <small>
                                Usa un identificador IANA, por ejemplo
                                {' '}America/La_Paz o Europe/Madrid.
                            </small>
                        </div>

                        <div className="calendar-settings-days">
                            {weekDays.map((day, dayOfWeek) => {
                                const dayRules = rules.filter(
                                    rule => rule.dayOfWeek === dayOfWeek,
                                );

                                return (
                                    <section
                                        className="calendar-settings-day"
                                        key={dayOfWeek}
                                    >
                                        <header>
                                            <div>
                                                <h3>{day}</h3>
                                                <small>
                                                    {dayRules.length
                                                        ? `${dayRules.length} intervalo${dayRules.length === 1 ? '' : 's'}`
                                                        : 'Sin horarios'}
                                                </small>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="small"
                                                leadingIcon={<FiPlus />}
                                                onClick={() => addRule(dayOfWeek)}
                                            >
                                                Agregar
                                            </Button>
                                        </header>

                                        {dayRules.map(rule => (
                                            <div
                                                className="calendar-settings-rule"
                                                key={rule.draftId}
                                            >
                                                <label className="calendar-settings-time">
                                                    <span>Desde</span>
                                                    <input
                                                        type="time"
                                                        value={rule.startTime}
                                                        onChange={event =>
                                                            updateRule(rule.draftId, {
                                                                startTime: event.target.value,
                                                            })
                                                        }
                                                    />
                                                </label>

                                                <label className="calendar-settings-time">
                                                    <span>Hasta</span>
                                                    <input
                                                        type="time"
                                                        value={rule.endTime}
                                                        onChange={event =>
                                                            updateRule(rule.draftId, {
                                                                endTime: event.target.value,
                                                            })
                                                        }
                                                    />
                                                </label>

                                                <label className="calendar-settings-active">
                                                    <input
                                                        type="checkbox"
                                                        checked={rule.active}
                                                        onChange={event =>
                                                            updateRule(rule.draftId, {
                                                                active: event.target.checked,
                                                            })
                                                        }
                                                    />
                                                    <span>Activo</span>
                                                </label>

                                                <button
                                                    type="button"
                                                    className="calendar-settings-remove"
                                                    aria-label={`Eliminar horario de ${day}`}
                                                    onClick={() => removeRule(rule.draftId)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        ))}
                                    </section>
                                );
                            })}
                        </div>

                        <footer className="calendar-settings-save">
                            <p>
                                {dirty
                                    ? 'Tienes cambios pendientes de guardar.'
                                    : 'Tu disponibilidad está guardada.'}
                            </p>

                            <Button
                                leadingIcon={<FiCheck />}
                                loading={savingRules}
                                disabled={savingRules || !dirty}
                                onClick={saveRules}
                            >
                                Guardar disponibilidad
                            </Button>
                        </footer>
                    </section>

                    <aside className="calendar-settings-aside">
                        <section>
                            <p className="ui-eyebrow">ENLACE PÚBLICO</p>
                            <h2>Comparte tu calendario.</h2>

                            <p>
                                Al activar el enlace, otras personas podrán consultar
                                tus espacios libres y enviarte solicitudes.
                            </p>

                            <div className="calendar-settings-link-status">
                                <span
                                    className={
                                        publicLink?.active
                                            ? 'is-active'
                                            : 'is-inactive'
                                    }
                                />

                                {publicLink?.active
                                    ? 'Calendario público activo'
                                    : 'Calendario público desactivado'}
                            </div>

                            <Button
                                variant={publicLink?.active ? 'secondary' : 'primary'}
                                loading={updatingLink}
                                disabled={
                                    updatingLink ||
                                    !publicLink ||
                                    (
                                        !publicLink.active &&
                                        (activeRulesCount === 0 || dirty)
                                    )
                                }
                                onClick={togglePublicLink}
                            >
                                {publicLink?.active
                                    ? 'Desactivar enlace'
                                    : 'Activar enlace público'}
                            </Button>

                            {publicLink?.url && (
                                <div className="calendar-settings-public-url">
                                    <small>Tu enlace para compartir</small>
                                    <p>{publicLink.url}</p>

                                    <Button
                                        variant="ghost"
                                        size="small"
                                        leadingIcon={<FiCopy />}
                                        onClick={copyLink}
                                    >
                                        Copiar enlace
                                    </Button>
                                </div>
                            )}
                        </section>

                        <section className="calendar-settings-privacy">
                            <h3>Tu agenda sigue siendo privada.</h3>
                            <p>
                                Solo publicamos los intervalos libres. Los visitantes
                                no pueden consultar nombres, descripciones ni detalles
                                de tus eventos privados.
                            </p>
                        </section>
                    </aside>
                </div>
            )}
        </MemberShell>
    );
}