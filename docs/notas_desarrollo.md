# Notas de desarrollo

## Plan de Desarrollo

El frontend se desarrolla con **React + TypeScript + Vite** y utiliza **CSS Modules con CSS estándar**. La prioridad inicial es construir un MVP funcional, sencillo de mantener y fácil de ampliar, evitando crear componentes o abstracciones antes de que exista una necesidad real de reutilización.

La aplicación se construirá progresivamente por etapas. Cada etapa tendrá su propio documento de notas de desarrollo con información más detallada sobre las decisiones tomadas, estructura, tipos, mocks, componentes y funcionalidades implementadas.

Las notas de desarrollo del backend se encuentran en el repositorio del [backend](https://github.com/candytale55/fullstack-project-backend/blob/main/docs/notas_desarrollo.md).

## Arquitectura de navegación de contenidos

El contenido sigue una jerarquía flexible:

```text
Language
└── Course
    ├── Units
    │   └── Exercises
    │
    └── Exercises
```

Un idioma puede contener varios cursos. Un curso puede estar organizado mediante unidades que contienen ejercicios o puede contener ejercicios directamente. Para mantener el MVP sencillo, cada curso utilizará una sola de estas estructuras.

Las páginas principales siguen este flujo:

```text
LanguagesPage
→ CoursesPage
→ CoursePage
→ UnitsPage o ExercisesPage
→ ExercisePage
```

`LanguagesPage` y `CoursesPage` muestran listados, mientras que `CoursePage` representa un curso concreto y determina si la navegación continúa hacia unidades o directamente hacia ejercicios.

## Etapas de desarrollo

## Etapa 1 - Esqueleto funcional del frontend

La primera etapa se centró en construir el **esqueleto completo y navegable del frontend** antes de conectarlo con el backend. Se implementaron las páginas principales del MVP (`LoginPage`, `RegisterPage`, `DashboardPage`, `LanguagesPage`, `CoursesPage`, `CoursePage`, `UnitsPage`, `ExercisesPage`, `ExercisePage`, `ProgressPage` y `NotFoundPage`), junto con sus rutas y una estructura básica mediante CSS Modules.

También se prepararon los tipos TypeScript necesarios para representar idiomas, cursos, unidades y ejercicios, utilizando datos mock para desarrollar y comprobar los distintos flujos mientras el backend permanece desacoplado. La autenticación funciona temporalmente mediante `AuthContext`, `AuthProvider`, `useAuth` y `ProtectedRoute`, permitiendo probar login, logout y navegación protegida con estado local.

Durante esta etapa se crearon además componentes UI básicos y reutilizables, como `Button`, `Input`, `Card`, `Alert` y `Loader`, junto con el layout general de la aplicación. Los estilos son deliberadamente simples: el objetivo actual es disponer de un MVP funcional, responsive y fácil de modificar, dejando el diseño visual definitivo y la integración con datos reales para etapas posteriores.

Para ampliar la información sobre esta etapa, consultar [Etapa 1 - Notas de desarrollo](notas/etapa-1-notas-desarrollo.md).


### Etapa 2 - Modelado de datos y API básica

Durante esta etapa se definió la estructura principal de datos del backend y las relaciones necesarias para soportar el contenido de la aplicación.

Se implementaron los modelos `Language`, `Course`, `VocabularyItem`, `Exercise` y `Progress`, además del modelo `User` ya existente. Las unidades se integraron como subdocumentos dentro de los cursos para mantener el modelo del MVP sencillo.

También se crearon los controllers y rutas principales para consultar y gestionar estas colecciones. El backend cuenta además con registro, login, hashing de contraseñas, JWT y middlewares para proteger rutas y controlar el acceso de administradores.

Los modelos de vocabulario y ejercicios quedan sujetos a una revisión final antes de realizar la carga definitiva de datos. La siguiente tarea pendiente relacionada con esta etapa es preparar el Excel/CSV de vocabulario con más de 100 registros y crear la semilla correspondiente para generar los datos iniciales de la base de datos.


### Etapa 3 - Integración frontend-backend

Sustitución progresiva de los mocks por datos reales mediante una capa de servicios en el frontend. Se conectarán primero autenticación y usuario, y después idiomas, cursos, unidades y ejercicios, manteniendo los componentes desacoplados de las llamadas directas a la API.



### Etapa 4 - Ejercicios y seguimiento de progreso

Implementación de al menos un tipo de ejercicio funcional del MVP y del flujo necesario para registrar sus resultados. El backend almacenará la información necesaria de progreso y el frontend la utilizará para actualizar `DashboardPage` y `ProgressPage`.

### Etapa 5 - Revisión Final

Revisión final del proyecto completo, incluyendo navegación, errores básicos, estados de carga, responsive esencial, limpieza de mocks y `console.log`, revisión de TODOs, ejecución de lint y build, comprobación del flujo principal y actualización de README y documentación.

