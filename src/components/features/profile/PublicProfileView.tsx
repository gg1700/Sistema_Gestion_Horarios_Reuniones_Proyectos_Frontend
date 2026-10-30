import type { ReactNode } from 'react';
import { FiArrowRight, FiExternalLink, FiMapPin, FiServer, FiStar } from 'react-icons/fi';
import { Avatar, OrbitalGraphic } from '../../ui';
import { WorkTimeline } from './ProfileParts';
import type { PublicSnapshot } from '../../../types/publicSnapshot';
export type { PublicSnapshot } from '../../../types/publicSnapshot';

// Recibe solo la información permitida para el visitante, sin el estado privado.
export function PublicProfileView({ profile, visitor = false, actions }: { profile: PublicSnapshot; visitor?: boolean; actions?: ReactNode }) {
  const fullName = [profile.name, profile.firstSurname, profile.secondSurname].filter(Boolean).join(' ');
  const personalLinks = profile.links && profile.links.length > 0 && <section className="public-personal-links-section"><h3>Enlaces personales</h3>{profile.links.map(link => <a className="public-personal-link" key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"><FiExternalLink /><div><strong>{link.label}</strong><span>{link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span></div><FiArrowRight /></a>)}</section>;
  const projects = profile.repositories && profile.repositories.length > 0 && <section className="public-projects"><div className="profile-section-head"><h3>Proyectos compartidos</h3><small>GitHub</small></div>{profile.repositories.map(repo => <article className="github-repository" key={repo.id}><header><FiServer /><h4>{repo.name}</h4><a href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${repo.name} en GitHub`}><FiExternalLink /></a></header><p>{repo.description ?? 'Sin descripción.'}</p><footer><span className={`repository-language repository-language--${(repo.language ?? 'unknown').toLowerCase()}`}>{repo.language ?? 'Lenguaje no especificado'}</span><span><FiStar />{repo.stars}</span><small>GitHub</small></footer></article>)}</section>;
  const hasAside = visitor ? Boolean(projects || profile.activity?.length) : Boolean(personalLinks || profile.activity?.length);
  return <div className={`public-profile-view ${visitor ? 'public-profile-view--visitor' : ''}`}><header><Avatar name={fullName} src={profile.image} size="large" /><div><p className="ui-eyebrow">PERFIL PÚBLICO</p><h2>{fullName}{visitor && <span className="ui-heading-period">.</span>}</h2><p>@{profile.handle}{profile.country && <><i>·</i><FiMapPin />{profile.country}</>}</p></div><div className="public-profile-view__orbit"><OrbitalGraphic /></div>{actions}</header>
    <div className={`public-profile-columns ${!hasAside ? 'public-profile-columns--single' : ''}`}><section>
      {profile.experiences && profile.experiences.length > 0 && <><h3>Experiencia laboral</h3><WorkTimeline experiences={profile.experiences} /></>}
      {profile.address && <section className="public-contact-block"><h3>Dirección</h3><p>{profile.address}</p></section>}
      {((profile.contactEmails?.length ?? 0) > 0 || (profile.phones?.length ?? 0) > 0) && <section className="public-contact-block"><h3>Contacto</h3>{profile.contactEmails?.map(email => <p key={email}>{email}</p>)}{profile.phones?.map(phone => <p key={phone}>{phone}</p>)}</section>}
      {visitor ? personalLinks : projects}
    </section>{hasAside && <aside>{visitor ? projects : personalLinks}
      {profile.activity && profile.activity.length > 0 && <section className="public-contact-block"><h3>Actividad reciente</h3>{profile.activity.map(event => <article key={event.id}><time dateTime={event.date}>{event.when}</time><h4>{event.title}</h4><p>{event.detail}</p></article>)}</section>}
    </aside>}</div>
  </div>;
}
