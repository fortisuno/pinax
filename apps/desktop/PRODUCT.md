# Product

<!-- impeccable:product-schema 1 -->

## Platform

desktop

> Platform value `desktop` is an explicit user choice that extends Impeccable's standard platform vocabulary (web/ios/android/adaptive). The renderer still runs inside an Electron Chromium window, so platform-specific design language references (e.g. `reference/ios.md`, `reference/android.md`) do not apply unless the user later adopts `adaptive`.

## Stack

Electron 30 + Vite 5 + React 19 + TypeScript 5, with Tailwind CSS v4, shadcn/ui, Zustand (with `persist` middleware to `localStorage`), TanStack Table/Form, Recharts, jsPDF + jspdf-autotable, Zod, lucide-react, next-themes. Built and packaged with `electron-builder`. Renderer entry: `apps/desktop/src/main.tsx`. Main process entry: `apps/desktop/electron/main.ts` (window `1280x720`, title `pinax`, icon `pinax.png`).

## Users

Profesores de primaria. Abren Pinax en su equipo personal para registrar las calificaciones de tareas de cada alumno, definir los criterios ponderados de su rúbrica (cantidad de tareas, peso de las tareas y criterios adicionales con su propio peso) y obtener la nota final ponderada de cada estudiante. La sesión típica ocurre durante el periodo escolar, en clase o al preparar el cierre de la unidad.

## Product Purpose

Pinax es una aplicación de escritorio que centraliza el cálculo de calificaciones de un grupo de primaria a partir de tareas y criterios configurables. Sustituye el cuaderno u hoja de cálculo por un flujo que: (1) registra alumnos y sus notas de tareas, (2) deja al docente componer su propia rúbrica ponderada, (3) calcula automáticamente la nota final y (4) entrega el resultado en un PDF presentable. Éxito = el docente cierra el periodo con el PDF en mano y la rúbrica intacta para el siguiente grupo.

## Positioning

Lo que un vecino no puede copiar con verdad:

- **Cálculo automático de notas finales ponderadas.** La combinación tareas + criterios en una sola nota final existe sin que el docente escriba fórmulas. Esta lógica debe quedar visible y comprensible en la UI aunque el lenguaje visual cambie.
- **Datos 100% locales y privados.** Todo vive en `localStorage` del dispositivo del docente. No hay cuentas, ni nube, ni telemetría. Es una promesa ética además de técnica.
- **Experiencia de aplicación de escritorio real.** Pinax se instala, abre como ventana propia (`1280x720`, título `pinax`, icono nativo), sin barra de navegador. La sensación de “app” es parte del producto, no un envoltorio cosmético.

## Operating Context

El docente trabaja en su equipo personal (Windows, macOS o Linux). No hay red obligatoria: la app funciona offline. La unidad de trabajo es el grupo de alumnos: el docente carga nombres, registra las notas de cada tarea según va corregiendo, ajusta los criterios de su rúbrica cuando lo necesita y, al cierre, exporta un PDF como entregable a la institución o a las familias. Materiales colaterales: lista de alumnos, planilla de notas previa, criterios del programa escolar. No hay login, no hay roles, no hay sync entre dispositivos.

## Capabilities and Constraints

Capacidades confirmadas:

- CRUD de alumnos (`add-student-dialog`, `update-student-dialog`) con validación Zod: nombre obligatorio, máximo 60 caracteres, sin duplicados (a verificar contra el store).
- Rúbrica configurable por el docente: cantidad de tareas (`assignmentsQuantityCriteria`, default 3), peso de las tareas en la nota final (`assignmentsPercentageCriteria`, default 100), y criterios adicionales (`otherCriteria`, default `[]`) con etiqueta y porcentaje propio (0–100).
- Registro de calificaciones por tarea (escala 0–10, un decimal).
- Cálculo de evaluación por alumno: `tasksAverage`, `tasks` (promedio ponderado por `assignmentsPercentage`), criterios crudos y ponderados, y `final`. Implementado en `apps/desktop/src/lib/students.ts` (`computeEvaluation`).
- Exportación a PDF a través del diálogo nativo de Electron (`pdf:save` IPC en `apps/desktop/electron/main.ts`), generado en el renderer con `jsPDF` + `jspdf-autotable`.
- Persistencia local con Zustand `persist`: claves `pinax-evaluation` y `pinax-students` en `localStorage`.
- Modo oscuro gestionado por `next-themes` (selector `html.dark`).

Restricciones durables (no se negocian):

- Escala de calificación **0–10 con un decimal**, validada por Zod (`gradeSchema` en `apps/desktop/src/lib/students.ts`). El rango 0–10 es del dominio y no debe ampliarse.
- Idioma **español** como idioma por defecto: etiquetas, copy, validaciones y mensajes de error en español. i18n queda abierto pero no se introduce inglés por defecto.
- Ponderación configurable: el docente define la cantidad de tareas, el peso de las tareas y los criterios adicionales. Esta flexibilidad no se reduce en rediseños.
- Persistencia 100% local: `localStorage` con las claves `pinax-evaluation` y `pinax-students`. Sin backend, sin sync obligatorio, sin analítica remota.

Hechos explícitamente no decididos: lista de cursos/niveles soportados dentro de primaria, manejo de alumnos repetidos entre cursos, importación masiva desde planillas, firma o sello digital del PDF, multi-idioma activo.

## Brand Commitments

- Nombre del producto: **Pinax Desktop** (en marketing/copy). Nombre interno de la app en Electron: **`pinax`** (`app.setName('pinax')` en `electron/main.ts`).
- Icono de ventana y favicon: **`pinax.png` / `pinax.svg`** en `apps/desktop/public/`.
- Logo y grafismo: tarjeta negra cuadrada con bordes redondeados y un glifo de gráfico de barras (loader de `apps/desktop/index.html` y favicon SVG). Sin palabra escrita en el logo; debe mantenerse monocromo y reversible en modo claro/oscuro.
- Idioma: español. Copy dirigido a un docente, no a un ingeniero: formal pero accesible, sin anglicismos innecesarios.
- Personalidad: herramienta seria de aula, no app de consumidor gamificada.

## Evidence on Hand

No hay testimonios de clientes, casos de estudio ni capturas de marketing en el repositorio. La única evidencia verificable es el propio producto: el código, los componentes `shadcn/ui` ya instalados (sidebar, dialog, drawer, table, card, chart con Recharts), y los `schema` de Zod que codifican las reglas del dominio. Cualquier cita, métrica o reconocimiento externo debe considerarse inexistente hasta que se aporte evidencia. El PDF exportado es, hoy, el único entregable tangible que el docente entrega a terceros.

## Product Principles

1. **La nota final es el producto.** Tareas + criterios ponderados se combinan en una sola nota; la UI existe para que ese cálculo sea visible y editable, no para decorar.
2. **Local por defecto.** Datos del docente en su equipo, sin cuentas ni nube. Si alguna vez se añade sync, debe ser opt-in y explícito.
3. **Rúbrica del docente, no del sistema.** El docente define la cantidad de tareas, el peso de las tareas y sus criterios adicionales; el sistema no impone una ponderación fija.
4. **Español, en serio.** Copy, validaciones y mensajes de error se leen como español natural para un profesor de primaria.
5. **El PDF es el entregable.** El PDF que sale debe verse presentable y completo por sí mismo; la pantalla es el medio, no el fin.

## Accessibility & Inclusion

No se ha confirmado un estándar de accesibilidad (WCAG 2.x AA, sección 508, etc.) con el usuario. La base sobre la que se construye ya aporta accesibilidad razonable: componentes `shadcn/ui` (Radix UI como primitivas) con foco por teclado, roles ARIA y navegación con lector de pantalla por defecto; uso de `TooltipProvider` y `SidebarProvider` desde `@base-ui/react`; respeto de `prefers-reduced-motion` en el loader (`index.html`). Pendiente de confirmar: contraste mínimo, navegación completa por teclado en tablas y diálogos personalizados, y soporte de tecnologías asistivas en el PDF exportado. No se asume conformidad WCAG hasta que se pida explícitamente.