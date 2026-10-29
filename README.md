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
