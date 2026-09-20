# Justificación de requisitos

## Referencias a la documentación: 
- [README](../README.md)
- [Notas de desarrollo](./notas_desarrollo.md)
- [Justificación de requisitos](./justificacion-requisitos.md)

## Alcance del proyecto

El proyecto es un **MVP Full Stack de una plataforma de estudio de idiomas orientada al usuario estudiante**.

El MVP permite registrar e identificar usuarios, seleccionar un idioma y un curso, navegar por sus unidades y realizar actividades de estudio con contenido obtenido desde una base de datos MongoDB.

El proyecto está planteado para continuar creciendo. Por este motivo, tanto frontend como backend utilizan una arquitectura modular y el backend incluye modelos, controladores, rutas y endpoints que no son necesarios todavía para la interfaz actual, pero que servirán posteriormente para ampliar actividades, progreso y desarrollar un dashboard de administración.

El diseño visual se mantiene deliberadamente sencillo para esta primera versión, priorizando funcionalidad, navegación, responsive y facilidad de modificación.

---

## Cumplimiento de requisitos

### 1. Proyecto Full Stack con sentido y utilidad

**Cumplido.**

La aplicación responde a una necesidad concreta: disponer de un entorno en el que un usuario pueda organizar y practicar contenido para el aprendizaje de idiomas.

El público objetivo del MVP es el **estudiante**. El flujo principal implementado es:

`Usuario → Idioma → Curso → Unidad → Ejercicio`

Actualmente se ha implementado como actividad funcional una práctica de conjugación de verbos portugueses alimentada con datos almacenados en MongoDB.

La futura administración de cursos, vocabulario y ejercicios queda fuera del alcance de este MVP, aunque el backend ya está preparado para incorporarla.

---

### 2. Tecnologías principales

**Cumplido.**

Se utilizan las tecnologías requeridas:

* **Frontend:** React + TypeScript + Vite.
* **Backend:** Node.js + Express + TypeScript.
* **Base de datos:** MongoDB + Mongoose.

Frontend y backend se desarrollan en **dos repositorios Git independientes** y se comunican mediante una API REST.

---

### 3. Variables CSS para colores, spacings y valores reutilizables

**Cumplido.**

Los valores globales reutilizables están centralizados en:

`src/styles/variables.css`

Incluyen colores, espaciados, dimensiones de layout y radios de borde. Los componentes consumen estas variables mediante CSS Modules.

Esto permite modificar posteriormente la identidad visual sin rehacer individualmente todos los componentes.

---

### 4. Reutilización y estructura de CSS

**Cumplido dentro del alcance del MVP.**

El frontend combina:

* `global.css` para estilos globales.
* `variables.css` para valores compartidos.
* CSS Modules para páginas y componentes.

Los estilos permanecen próximos al componente al que pertenecen y se reutilizan variables globales para mantener consistencia.

Al tratarse de un MVP, algunos módulos específicos conservan estilos propios cuando abstraerlos no aporta todavía una ventaja funcional.

---

### 5. Mínimo dos colecciones relacionadas además de usuarios

**Cumplido.**

La base de datos contiene varias colecciones relacionadas, entre ellas:

* `users`
* `languages`
* `courses`
* `portugueseVerbConjugations`
* `vocabulary`
* `exercises`
* `progresses`

Ejemplos de relaciones:

* `Course → Language`
* `PortugueseVerbConjugation → Course`
* `PortugueseVerbConjugation → Unit`
* `Vocabulary → Course`
* `Exercise → Course`
* `Exercise → VocabularyItem`
* `Progress → User`
* `Progress → Course`
* `Progress → Exercise`

Las unidades se almacenan como subdocumentos dentro de `Course`.

La estructura supera el mínimo de colecciones relacionadas solicitado y permite ampliar posteriormente el contenido sin rediseñar la base de datos.

---

### 6. Buena arquitectura en React

**Cumplido.**

El frontend está organizado por responsabilidades:

```text
src/
├── components/
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

Las páginas realizan principalmente composición y navegación; los servicios concentran las llamadas al backend; el estado de autenticación se gestiona mediante Context; y los tipos, estilos y componentes reutilizables se mantienen separados.

Esta estructura permite añadir nuevas actividades y sustituir progresivamente módulos sin rehacer el resto de la aplicación.

---

### 7. Buena UX/UI

**Cumplido dentro del alcance del MVP.**

La interfaz se ha diseñado para que el usuario pueda seguir de forma sencilla el flujo de estudio:

`Login/Register → Idiomas → Cursos → Unidades → Ejercicio`

Se incluyen:

* navegación consistente;
* rutas protegidas;
* estados de carga y error;
* feedback de respuesta correcta/incorrecta;
* pantalla inicial y final de ejercicio;
* navegación de salida;
* diseño responsive para desktop y móvil;
* componentes y layout comunes.

La estética es deliberadamente sencilla. El objetivo de esta fase es proporcionar una interfaz funcional, clara y fácilmente modificable antes de desarrollar una identidad visual más completa y un futuro dashboard administrativo.

---

### 8. Componentización y reutilización

**Cumplido.**

Existen componentes reutilizables para responsabilidades comunes:

* `Button`
* `Input`
* `Card`
* `Alert`
* `Loader`
* `AppLayout`
* `PageContainer`
* `NavBar`
* `ProtectedRoute`
* `LoginForm`
* `RegisterForm`

Los componentes reciben props tipadas con TypeScript y las responsabilidades específicas de los ejercicios se encuentran separadas de las páginas.

La práctica de conjugación también separa componente, utilidades y servicio de acceso a datos.

---

### 9. Generación de la base de datos a partir de datos CSV

**Cumplido.**

El contenido inicial se genera mediante seeds.

La colección de conjugaciones portuguesas utiliza un archivo CSV con el dataset inicial requerido. El proceso:

1. lee el CSV mediante `fs`;
2. lo interpreta mediante `csv-parse`;
3. valida los campos;
4. localiza los cursos y unidades correspondientes;
5. transforma los códigos legibles en referencias de MongoDB;
6. detecta duplicados;
7. crea los documentos;
8. los inserta mediante `insertMany`.

Los modelos existen antes de ejecutar las semillas.

También existen seeds independientes para usuarios, idiomas y cursos.

**Nota para entrega:** el CSV final debe contener al menos los **100 registros exigidos por el enunciado**.

---

### 10. Uso de Hooks de React para funcionalidades necesarias

**Cumplido.**

Los Hooks se utilizan para necesidades reales de la aplicación:

* `useState` para estado de componentes, formularios y ejercicios.
* `useEffect` para restauración de sesión y carga de datos desde la API.
* `useContext` para autenticación.
* hook personalizado `useAuth`.
* `useNavigate` para navegación programática.
* `useParams` para rutas dinámicas.

El contexto de autenticación restaura la sesión utilizando el token almacenado y consulta `/api/v1/auth/me`.

---

### 11. Usuarios, autenticación y control de acceso

**Cumplido.**

El sistema dispone de:

* colección `User`;
* registro de usuarios;
* login;
* hash de contraseñas mediante `bcrypt`;
* generación y validación de JWT;
* restauración de sesión;
* rutas protegidas;
* roles `user` y `admin`;
* middleware `isAuth`;
* middleware `isAdmin`.

En frontend, las páginas privadas utilizan `ProtectedRoute`.

El MVP está dirigido al usuario estudiante. Las operaciones administrativas ya existentes en el backend forman parte de la arquitectura preparada para una futura interfaz de administración y no necesitan estar expuestas todavía desde el frontend.

---

### 12. API y arquitectura backend

**Cumplido.**

El backend está organizado mediante:

```text
models
controllers
routes
middlewares
utils
seeds
```

La API dispone de endpoints para autenticación, usuarios, idiomas, cursos, unidades, vocabulario, ejercicios, progreso y conjugaciones portuguesas.

El frontend utiliza actualmente solo los endpoints necesarios para el MVP. Los endpoints CRUD adicionales permiten continuar desarrollando la aplicación sin tener que rehacer la arquitectura del backend.

---

### 13. README y documentación

**Cumplido.**

Los repositorios contienen README y documentación complementaria que explican:

* objetivo del proyecto;
* alcance del MVP;
* tecnologías;
* arquitectura;
* instalación;
* conexión frontend/backend;
* variables de entorno;
* despliegue;
* estructura principal;
* evolución futura.

El README del frontend incluye además capturas de pantalla del MVP.

---

### 14. Despliegue frontend y backend

**Cumplido.**

Los dos repositorios se encuentran desplegados independientemente en Vercel y están conectados entre sí.

**Frontend**

`https://fullstack-project-frontend-nine.vercel.app/`

**Backend**

`https://fullstack-project-backend-woad.vercel.app/`

El healthcheck del backend está disponible en su ruta raíz.

La aplicación también puede ejecutarse completamente en modo local.

Las variables privadas de entorno no se almacenan en Git. Para la evaluación se proporcionarán por separado en la plataforma de entrega, junto con los archivos `.env.example` que indican la estructura necesaria.

---

## Alcance del MVP y evolución futura

El objetivo de esta entrega no es completar todas las funcionalidades posibles de una plataforma educativa, sino demostrar un **flujo Full Stack completo y funcional para el usuario estudiante**.

La aplicación ya dispone de una arquitectura preparada para incorporar posteriormente:

* nuevas actividades;
* vocabulario adicional;
* persistencia y visualización ampliada del progreso;
* más idiomas y cursos;
* gestión de contenido;
* dashboard administrativo;
* mejoras visuales.

Por ello existen modelos, controllers, routes y endpoints que todavía no son consumidos por el frontend actual. No constituyen funcionalidades incompletas del MVP, sino infraestructura preparada para la evolución del proyecto.

---

## Funcionalidades opcionales

Cloudinary y la subida de archivos no forman parte del alcance de este MVP.

Su ausencia no afecta a los requisitos obligatorios del proyecto.

---

# Tabla sintetizada de evidencias

| Requisito                | Estado   | Evidencia principal                                                                             |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| Proyecto Full Stack útil | Cumplido | Flujo Usuario → Idioma → Curso → Unidad → Ejercicio                                             |
| React + Node.js          | Cumplido | Frontend React/Vite y API Node/Express                                                          |
| Variables CSS            | Cumplido | `src/styles/variables.css`                                                                      |
| CSS estructurado         | Cumplido | `global.css`, variables y `*.module.css`                                                        |
| Colecciones relacionadas | Cumplido | `Language`, `Course`, `PortugueseVerbConjugation`, `Vocabulary`, `Exercise`, `Progress`, `User` |
| Arquitectura React       | Cumplido | `pages`, `components`, `services`, `context`, `hooks`, `types`                                  |
| UX/UI                    | Cumplido | navegación, feedback, responsive y estados de interfaz                                          |
| Componentización         | Cumplido | UI components, layouts, auth forms y módulo de ejercicio                                        |
| CSV + `fs` + seed        | Cumplido | `portugueseVerbConjugation.seed.ts` + CSV                                                       |
| Hooks                    | Cumplido | `useState`, `useEffect`, `useContext`, `useAuth`, `useNavigate`, `useParams`                    |
| Usuarios y acceso        | Cumplido | JWT, bcrypt, `isAuth`, `isAdmin`, `ProtectedRoute`                                              |
| API REST                 | Cumplido | controllers + routes por dominio                                                                |
| README                   | Cumplido | README de repositorios + screenshots                                                            |
| Despliegue               | Cumplido | frontend y backend desplegados en Vercel                                                        |
