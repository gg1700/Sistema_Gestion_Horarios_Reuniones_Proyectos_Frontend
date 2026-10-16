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
