# Justificación de requisitos

Este documento sirve como guía para registrar cómo se da cumplimiento a los requisitos definidos por la escuela para el proyecto FullStack.

## Requisitos generales del proyecto

### Proyecto FullStack con sentido y utilidad

El proyecto debe utilizar los conocimientos adquiridos durante el curso para desarrollar una aplicación FullStack que tenga un propósito definido y resuelva un problema o necesidad concreta.

**Elementos evaluables:**

* El proyecto debe tener un sentido lógico.
* Debe resolver un problema o necesidad concreta.
* Debe estar dirigido a un público objetivo definido.
* Las decisiones funcionales y técnicas deben responder al propósito del proyecto.

**Cumplimiento:** Parcial.

El proyecto tiene un propósito definido: crear una aplicación para el aprendizaje de idiomas mediante cursos, unidades y ejercicios, permitiendo además consultar el progreso del usuario. La arquitectura funcional ya se ha diseñado alrededor de este objetivo.

<!-- //TODO: Todavía debe ampliarse la documentación del público objetivo y de la necesidad concreta que pretende resolver antes de considerar completamente cerrado este requisito. -->

**Evidencia:**

* Arquitectura de contenido definida como `Language → Course → Unit → Exercise`.
* Soporte para cursos estructurados por unidades y cursos que contienen ejercicios directamente.
* `DashboardPage`, `LanguagesPage`, `CoursesPage`, `CoursePage`, `UnitsPage`, `ExercisesPage`, `ExercisePage` y `ProgressPage`.
* `README.md` del frontend.
* `notas_desarrollo.md`.
* `notas/etapa-1-notas-desarrollo.md`.

---

### Tecnologías principales

El proyecto debe utilizar las tecnologías establecidas por la escuela:

* Node.js para el backend.
* React para el frontend.

Las librerías adicionales son opcionales y pueden seleccionarse según las necesidades del proyecto.

**Cumplimiento:** Cumplido.

El proyecto utiliza las tecnologías principales indicadas. El backend está desarrollado con Node.js y Express utilizando TypeScript, mientras que el frontend utiliza React, TypeScript y Vite.

**Evidencia:**

* Repositorio independiente `fullstack-project-backend`.
* Backend basado en Node.js + Express + TypeScript + Mongoose.
* Repositorio independiente `fullstack-project-frontend`.
* Frontend basado en React + TypeScript + Vite.
* `package.json` de ambos proyectos.
* `vite.config.ts` en el frontend.
* `tsconfig.json` en el backend.

---

## Requisitos según el enunciado

### 1. Variables en `style.css` de colores, spacings, etc.

**Elementos evaluables:**

* Definición centralizada de valores reutilizables de estilos.
* Variables para colores utilizados de forma recurrente.
* Variables para espaciados.
* Posibilidad de incluir otras variables reutilizables necesarias para mantener consistencia visual.

**Cumplimiento:** Cumplido.

Los valores reutilizables de estilos se encuentran centralizados mediante variables CSS. Se utiliza un archivo específico `variables.css` en lugar de concentrarlas directamente en `style.css`, manteniendo la misma finalidad de centralización requerida.

Actualmente las variables incluyen colores, espaciados, dimensiones de layout y radios de borde. Los valores visuales son provisionales y podrán modificarse posteriormente sin necesidad de cambiar individualmente cada componente.

**Evidencia:**

* `src/styles/variables.css`.
* Variables como:

  * `--color-background`
  * `--color-surface`
  * `--color-text`
  * `--color-text-muted`
  * `--color-border`
  * `--space-xs`
  * `--space-sm`
  * `--space-md`
  * `--space-lg`
  * `--space-xl`
  * `--content-max-width`
  * `--navbar-height`
  * `--border-radius-sm`
  * `--border-radius-md`

---

### 2. Reutilización correcta de CSS y buena estructura de los mismos (en caso de utilizar CSS)

**Elementos evaluables:**

* Evitar duplicación innecesaria de estilos.
* Organización clara de los archivos CSS.
* Separación adecuada entre estilos globales y estilos específicos de componentes.
* Reutilización de valores y reglas comunes.
* Estructura comprensible y mantenible.

**Cumplimiento:** Parcial.

Se ha establecido una estructura clara basada en CSS Modules, estilos globales y variables CSS compartidas. Cada página o componente mantiene sus estilos locales separados, mientras que los valores comunes se centralizan.

<!-- //TODO: Durante la construcción inicial todavía existe cierta repetición entre páginas y tarjetas similares. Esta duplicación se revisará conforme se identifiquen patrones reales de reutilización, evitando abstraer componentes prematuramente. -->

**Evidencia:**

* `src/styles/global.css`.
* `src/styles/variables.css`.
* Uso de archivos `*.module.css` asociados a páginas y componentes.
* Ejemplos:

  * `LoginPage.module.css`
  * `RegisterPage.module.css`
  * `DashboardPage.module.css`
  * `NavBar.module.css`
  * `Button.module.css`
  * `Card.module.css`
  * `Input.module.css`

---

### 3. Mínimo deberá haber dos colecciones relacionadas aparte de la colección de los usuarios

**Elementos evaluables:**

* Existencia de una colección de usuarios.
* Existencia de al menos dos colecciones adicionales.
* Las colecciones adicionales deben estar relacionadas entre sí.
* Las relaciones deben utilizar datos o identificadores que permitan vincular los documentos correspondientes.
* Los modelos de las colecciones deben estar definidos en el backend antes de realizar la carga de datos.

**Cumplimiento:** Pendiente.

Actualmente existe el modelo de usuario en el backend, pero todavía no se han implementado los modelos definitivos correspondientes a la estructura de contenido del proyecto.

La arquitectura prevista contempla varias entidades relacionadas (`Language`, `Course`, `Unit`, `Exercise` y `Progress`), pero no se considerará cumplido este requisito hasta que las colecciones y sus relaciones existan realmente en MongoDB.

**Evidencia actual:**

* Modelo `User` implementado en el backend.
* Arquitectura de datos prevista documentada como:

```text
Language
└── Course
    ├── Unit
    │   └── Exercise
    └── Exercise
```

* Implementación de los modelos adicionales pendiente.

---

### 4. Buena arquitectura en React

**Elementos evaluables:**

* Estructura de carpetas y archivos clara.
* Separación lógica de responsabilidades.
* Código organizado de forma que pueda ser comprendido por una persona que no conozca previamente el proyecto.
* Separación adecuada de componentes, lógica, tipos, servicios u otras responsabilidades cuando corresponda.
* Arquitectura preparada para mantener y ampliar la aplicación.

**Cumplimiento:** Cumplido.

El frontend está dividido por responsabilidades, manteniendo separadas páginas, componentes, contexto, hooks, servicios, tipos, mocks y estilos. Las páginas se encargan principalmente de composición y navegación, mientras que las responsabilidades compartidas se mantienen en módulos independientes.

La estructura también permite sustituir progresivamente los mocks por servicios reales sin necesidad de rehacer la arquitectura de páginas.

**Evidencia:**

```text
src/
├── components/
│   ├── auth/
│   ├── layout/
│   └── ui/
├── context/
├── hooks/
├── mocks/
├── pages/
├── services/
├── styles/
├── types/
├── App.tsx
└── main.tsx
```

* `AuthContext.ts`.
* `AuthProvider.tsx`.
* `useAuth.ts`.
* `ProtectedRoute.tsx`.
* `AppLayout`.
* `PageContainer`.
* Tipos separados en `src/types/`.
* Mocks separados en `src/mocks/`.
* Capa `src/services/` preparada para comunicación con la API.

---

### 5. Buena UX/UI

**Elementos evaluables:**

* La aplicación debe tener un funcionamiento y navegación coherentes.
* La interfaz debe responder al propósito del proyecto.
* El diseño debe estar adaptado al público objetivo definido.
* Las decisiones de interfaz e interacción deben tener una justificación funcional.
* La experiencia de usuario debe facilitar la realización de las tareas principales de la aplicación.

**Cumplimiento:** Parcial.

La navegación básica y los flujos principales ya están definidos y permiten recorrer de forma coherente la estructura de aprendizaje desde idioma hasta ejercicio. También existe navegación independiente hacia Dashboard y progreso.

El diseño visual actual es deliberadamente básico porque en esta etapa se ha priorizado construir un MVP funcional y fácil de modificar. La identidad visual definitiva, los ajustes detallados de responsive y otros elementos de UX/UI se revisarán durante la fase de cierre.

**Evidencia:**

* Navegación principal mediante `NavBar`.
* Flujo:

```text
Languages
→ Courses
→ Course
→ Units / Exercises
→ Exercise
```

* `DashboardPage`.
* `ProgressPage`.
* `NotFoundPage`.
* Layout compartido mediante `AppLayout` y `PageContainer`.
* CSS Modules con responsive básico mediante media queries.

---

### 6. Mejores prácticas en cuanto a componentización y reutilización

**Elementos evaluables:**

* Creación de componentes reutilizables cuando exista funcionalidad o estructura común.
* Evitar duplicación innecesaria de componentes.
* Separación adecuada de componentes según sus responsabilidades.
* Uso de propiedades (`props`) para adaptar componentes reutilizables a diferentes contextos.
* Componentes organizados de forma clara y mantenible.

**Cumplimiento:** Parcial.

Ya se han creado componentes UI reutilizables para estructuras comunes y se han separado los formularios de autenticación de sus páginas correspondientes. Los componentes utilizan props y tipos de React para poder adaptarse a diferentes situaciones.

Los componentes específicos del dominio se extraerán únicamente cuando la repetición existente justifique su reutilización, evitando crear abstracciones innecesarias durante la fase inicial del MVP.

**Evidencia:**

* `Button`
* `Input`
* `Card`
* `Alert`
* `Loader`
* `PageContainer`
* `AppLayout`
* `NavBar`
* `LoginForm`
* `RegisterForm`
* Uso de props tipadas, por ejemplo:

  * variantes de `Button`;
  * variantes de `Alert`;
  * tamaños de `Loader`;
  * atributos HTML reutilizados mediante tipos de React.

---

### 7. Se genera la BBDD a partir del Excel de datos

**Elementos evaluables:**

* Creación inicial de un Excel con un mínimo de 100 datos.
* Los datos deben corresponder a las colecciones necesarias para el proyecto.
* El Excel debe poder descargarse o exportarse como CSV.
* Uso de lectura/escritura de archivos de Node.js mediante `fs` para obtener los datos del archivo.
* Creación de una o varias semillas para insertar los datos en la base de datos.
* Los modelos correspondientes deben existir antes de ejecutar las semillas.
* La información importada debe mantener correctamente las relaciones necesarias entre las colecciones.

**Cumplimiento:** Pendiente.

La estructura de datos definitiva del backend se encuentra todavía en desarrollo. Este requisito se realizará después de definir los modelos y relaciones correspondientes.

**Evidencia:**

* Pendiente de implementación.
* Antes de realizar la carga deberán existir los modelos definitivos de las colecciones implicadas.

---

### 8. Se utilizan Hooks avanzados en React para funcionalidades concretas y necesarias

**Elementos evaluables:**

* Uso de Hooks de React para resolver funcionalidades reales de la aplicación.
* Los Hooks utilizados deben responder a una necesidad concreta y no incluirse únicamente para cumplir el requisito.
* El uso de Hooks debe contribuir a una correcta gestión del estado, efectos, contexto u otra lógica de React según las necesidades del proyecto.

**Cumplimiento:** Parcial.

Los Hooks ya se utilizan para resolver necesidades reales de la aplicación. La autenticación utiliza estado y contexto de React, y se creó el hook personalizado `useAuth` para centralizar el acceso a dicha funcionalidad. Las páginas de contenido utilizan además los hooks de React Router para navegación y lectura de parámetros dinámicos.

El uso de hooks continuará ampliándose cuando el frontend se conecte con el backend, especialmente para la carga y actualización de datos.

**Evidencia:**

* `useState` para estado de formularios y autenticación.
* `useContext` dentro de `useAuth`.
* Hook personalizado `useAuth`.
* `useNavigate` para navegación programática.
* `useParams` para acceder a parámetros como `languageId`, `courseId`, `unitId` y `exerciseId`.

---

## Otros requisitos obligatorios indicados en la descripción

### Colección de usuarios y control de acceso

El backend debe incluir una colección de usuarios independientemente de la temática elegida.

**Elementos evaluables:**

* Existencia de una colección de usuarios.
* Posibilidad de identificar si un usuario está autenticado.
* Existencia de rutas cuyo acceso dependa de que el usuario esté autenticado.
* Cuando el proyecto utilice roles, posibilidad de limitar determinadas rutas según el rol del usuario.

**Cumplimiento:** Parcial.

El backend ya dispone del modelo de usuario. En el frontend existe además una primera implementación funcional del estado de autenticación y del control de rutas mediante Context y `ProtectedRoute`.

La autenticación del frontend continúa utilizando un usuario mock, por lo que todavía debe integrarse con el sistema real del backend y con JWT antes de considerar completamente cumplido el requisito.

**Evidencia:**

Backend:

* Modelo `User`.
* Campo `role` preparado para diferenciar usuarios.
* CRUD inicial de usuarios.

Frontend:

* `AuthContext.ts`.
* `AuthProvider.tsx`.
* `useAuth.ts`.
* `ProtectedRoute.tsx`.
* `LoginPage` y `LoginForm`.
* `RegisterPage` y `RegisterForm`.
* Redirección de usuarios no autenticados hacia `/login`.
* `logout()` elimina el usuario actual y devuelve al usuario a `/login`.

---

### README del proyecto

Se debe crear documentación que explique detalladamente el sentido del proyecto.

**Elementos evaluables:**

* Explicación del propósito del proyecto.
* Problema o necesidad que pretende resolver.
* Público al que está dirigido.
* Explicación suficiente para comprender el sentido general de la aplicación.

**Cumplimiento:** Parcial.

Existen README iniciales separados para frontend y backend y documentación adicional sobre el desarrollo. El README del frontend explica actualmente el objetivo general, responsabilidades y tecnologías utilizadas.

Todavía debe ampliarse la documentación final para explicar de forma más detallada el problema que resuelve la aplicación y su público objetivo.

**Evidencia:**

* `README.md` del frontend.
* `README.md` del backend.
* `notas_desarrollo.md`.
* Documentación por etapas de desarrollo.

---

### Despliegue del backend y frontend

Tanto el backend como el frontend deben estar desplegados.

**Elementos evaluables:**

* Backend desplegado y accesible.
* Frontend desplegado y accesible.
* Los enlaces de despliegue deben poder localizarse a partir de los repositorios de GitHub.

**Cumplimiento:** Pendiente.

El frontend y el backend se encuentran todavía en desarrollo local y no se consideran desplegados como versión final.

**Evidencia:**

* Pendiente de despliegue.
* Los enlaces se añadirán a los respectivos repositorios cuando se realice el despliegue.

---

## Elementos opcionales puntuables

Los siguientes elementos no son requisitos obligatorios, pero el enunciado indica expresamente que pueden valorarse positivamente.

### Uso de librerías no vistas durante el curso

Se valorará positivamente la utilización justificada de librerías que no hayan sido explicadas durante el curso.

**Implementación:** Pendiente de determinar.

Por ahora no se documenta ninguna librería como cumplimiento de este apartado hasta confirmar que se trata de una librería no vista durante el curso y que su uso está justificado funcionalmente.

**Evidencia:**

* Pendiente.

### Cloudinary y subida de archivos desde el frontend

El uso de Cloudinary es opcional y puntuable.

Su implementación puede requerir investigar la subida de archivos desde el frontend mediante `FormData`.

**Implementación:** No implementado actualmente.

Cloudinary no forma parte por ahora del alcance implementado del proyecto final.

**Evidencia:**

* Sin implementación actual.
