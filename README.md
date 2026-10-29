# Sistema de Gestión de Horarios, Reuniones y Proyectos - Frontend

Frontend del proyecto desarrollado con React + Vite + TypeScript + Tailwind CSS.

## Requisitos
- Node.js 18 o superior
- npm

## Instalación
```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts
- `npm run dev`: servidor de desarrollo
- `npm run build`: compilación para producción
- `npm run preview`: vista previa del build

## Estructura de carpetas
```
src/
├── api/          # Llamadas al backend
├── assets/       # Imágenes y recursos estáticos
├── components/
│   ├── features/ # Componentes de funcionalidad
│   ├── layouts/  # Header, Sidebar, Footer, Layout
│   ├── modals/   # Modales
│   └── ui/       # Botones, campos, tarjetas reutilizables
├── constants/
├── contexts/
├── data/         # Datos JSON de prueba
├── hooks/
├── mocks/
├── pages/
├── routes/
├── types/
└── utils/
```

## Integración de visibilidad (T-17)

- `/perfil/visibilidad` consulta `GET /api/v1/profile` y `GET /api/v1/profile/visibility`.
- Guarda únicamente los elementos modificados mediante `PATCH /api/v1/profile/visibility`, con `{ changes: [{ type, id, visible }] }`.
- `api/visibilityApi.ts` gestiona HTTP, `hooks/useVisibilitySettings.ts` el estado y `types/visibility.ts` el contrato. Las rutas antiguas de demostración conservan sus mocks.
- Configurar `VITE_API_URL` con el origen del backend (por defecto `http://localhost:3000`). Las peticiones incluyen la cookie de sesión; el origen del frontend debe coincidir con el permitido por CORS en el backend. El acceso simulado no crea esa sesión.
- El backend necesita las tablas que consulta T-15, incluidas `repository`, `github_activity_list` y `github_activity_grid`. Un error del backend se presenta en pantalla; no se reemplaza por datos ficticios.
- La versión visual anterior, incluida su vista previa simulada, se conserva en `/visibility-flow-preview`. La vista previa real corresponde a T-18 y aún está pendiente.
- El nombre de los repositorios queda pendiente del endpoint de repositorios: T-15 solo devuelve su identificador y visibilidad. La cabecera global y el menú de cuenta todavía pertenecen al flujo simulado compartido.
- Ejecutar `npm run test:visibility` para verificar el contrato HTTP y la selección de cambios.

## Base visual compartida

- `styles/tokens.css`: paleta oscura, tipografías, espaciado, radios y tamaños comunes.
- `styles/shared.css`: estilos de los componentes, layouts y adaptación a móvil.
- `assets/fonts/`: Inter y Space Grotesk locales, reutilizadas del prototipo.
- `components/ui/`: botones, campos, selectores, interruptores, avatar, indicadores,
  avisos, tabla, encabezados, estado vacío y gráfico orbital.
- `components/layouts/`: marca, navegación, cabecera, pie y contenedores para
  contenido público, personal y administrativo.
- `components/modals/`: diálogo y confirmación reutilizables. El diálogo nativo
  administra el foco y mantiene el contenido exterior fuera de la navegación por teclado.
- `contexts/UIContext.tsx`: apertura del menú móvil y avisos transitorios.
- `hooks/useDisclosure.ts`: apertura y cierre local de diálogos.
- `constants/paths.ts`: rutas existentes; `constants/navigation.ts`: enlaces que
  pueden utilizarse en la navegación actual.

`AppProviders` está montado en la raíz. Se puede usar `useUI().notify(mensaje,
'success')` para mostrar un aviso y `useDisclosure()` para controlar un diálogo.
El estado de formularios, selección y filtros se mantiene en el componente que lo utiliza.

Los layouts aceptan navegación, acciones e identidad visual mediante props.
`AppLayout` y `AdminLayout` incluyen un `main` y admiten hijos o rutas anidadas con
`Outlet`; sus hijos no deben añadir otro `main`. `AdminLayout` es un contenedor
visual, sin lógica de permisos.
