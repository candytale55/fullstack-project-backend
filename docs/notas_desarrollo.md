# 🧿 Notas de desarrollo — Language Learning MVP

Este documento reúne los detalles técnicos y decisiones de implementación que se han retirado del README para mantenerlo breve y orientado a la presentación y ejecución del proyecto.

<a id="indice"></a>
## Índice

- [Referencias a la documentación](#referencias-documentacion)
- [Referencias del proyecto](#referencias-proyecto)
- [Alcance del MVP](#alcance-mvp)
- [Tecnologías](#tecnologias)
  - [Frontend](#tecnologias-frontend)
  - [Backend](#tecnologias-backend)
  - [Deployment](#tecnologias-deployment)
- [Arquitectura general](#arquitectura-general)
  - [Frontend](#arquitectura-frontend)
  - [Backend](#arquitectura-backend)
- [Base de datos](#base-datos)
- [Seeds y carga inicial](#seeds-carga-inicial)
  - [Datos base](#datos-base)
  - [Conjugaciones portuguesas](#conjugaciones-portuguesas)
- [Autenticación](#autenticacion)
- [API](#api)
- [Diseño y UX](#diseno-ux)
- [Uso de inteligencia artificial](#uso-inteligencia-artificial)
- [Dashboard y progreso](#dashboard-progreso)
- [Evolución prevista](#evolucion-prevista)

<a id="referencias-documentacion"></a>
## Referencias a la documentación: 
- [README](../README.md)
- [Notas de desarrollo](./notas_desarrollo.md)
- [Justificación de requisitos](./justificacion-requisitos.md)

La documentación es la misma tanto en los repositorios del Frontend como del Backend.

La explicación resumida del proyecto y las instrucciones de instalación se encuentran en [README.md](../README.md).  

La correspondencia entre la implementación y los requisitos evaluables se documenta en [justificacion_requisitos.md](./justificacion-requisitos.md).

<p><a href="#indice">Volver al índice</a></p>

<a id="referencias-proyecto"></a>
## Referencias del proyecto

**Frontend**
- GitHub: https://github.com/candytale55/fullstack-project-frontend
- Vercel: https://fullstack-project-frontend-nine.vercel.app/

**Backend**
- GitHub: https://github.com/candytale55/fullstack-project-backend
- Vercel: https://fullstack-project-backend-woad.vercel.app/

<p><a href="#indice">Volver al índice</a></p>


---

<a id="alcance-mvp"></a>
## Alcance del MVP

El MVP está orientado al **usuario estudiante**, no al administrador.

El flujo principal implementado es:

```text
User
 ↓
Language
 ↓
Course
 ↓
Unit
 ↓
Exercise
```

La actividad funcional principal es una práctica de **conjugación de verbos portugueses** que obtiene su contenido desde MongoDB.

El proyecto está planteado para continuar creciendo. Parte del backend ya contiene modelos, controllers, routes y endpoints que todavía no son consumidos por el frontend actual, pero que servirán para ampliar actividades, progreso y administración de contenido.

<p><a href="#indice">Volver al índice</a></p>

---

<a id="tecnologias"></a>
## Tecnologías

<a id="tecnologias-frontend"></a>
### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS Modules



<a id="tecnologias-backend"></a>
### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JSON Web Tokens
- bcrypt
- CORS
- csv-parse

<a id="tecnologias-deployment"></a>
### Deployment

- Vercel
- MongoDB Atlas


<p><a href="#indice">Volver al índice</a></p>

---

<a id="arquitectura-general"></a>
## Arquitectura general

El proyecto utiliza **dos repositorios independientes**:

```text
fullstack-project-frontend
fullstack-project-backend
```

El frontend consume la API mediante:

```env
VITE_API_URL=
```

El backend controla el origen permitido mediante:

```env
FRONTEND_URL=
```

La separación permite desarrollar y desplegar ambas partes de manera independiente.

<a id="arquitectura-frontend"></a>
### Frontend

```text
src/
├── components/
│   ├── auth/
│   ├── exercises/
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

Responsabilidades principales:

- `components` → componentes reutilizables y módulos de ejercicio.
- `pages` → pantallas y composición.
- `services` → comunicación con el backend.
- `context` → estado global de autenticación.
- `hooks` → lógica React reutilizable.
- `types` → contratos TypeScript.
- `styles` → estilos globales y variables.

<p><a href="#indice">Volver al índice</a></p>

<a id="arquitectura-backend"></a>
### Backend

```text
src/
├── api/
│   ├── controllers/
│   ├── models/
│   └── routes/
├── config/
├── middlewares/
├── utils/
│   └── seeds/
└── index.ts
```

La API separa modelos, controllers, routes, middlewares y utilidades para mantener responsabilidades claras.


<p><a href="#indice">Volver al índice</a></p>

---

<a id="base-datos"></a>
## Base de datos

La base de datos utiliza MongoDB y Mongoose.

Colecciones principales:

```text
users
languages
courses
portugueseVerbConjugations
vocabulary
exercises
progresses
```

Relaciones relevantes:

```text
Language
   ↑
 Course
   ↑
PortugueseVerbConjugation

User → Progress → Course
               → Exercise
```

Las unidades se almacenan como subdocumentos dentro de `Course`.

Además de las colecciones utilizadas directamente por el MVP actual, existen estructuras preparadas para vocabulario, ejercicios y progreso que permiten continuar el desarrollo sin rediseñar la base de datos.

<p><a href="#indice">Volver al índice</a></p>

---

<a id="seeds-carga-inicial"></a>
## Seeds y carga inicial

La carga inicial se divide en dos pasos.

<a id="datos-base"></a>
### 1. Datos base

```bash
npm run seed:all
```

Script:

```json
"seed:all": "tsx src/utils/seeds/master.seed.ts"
```

El master seed ejecuta los seeds base respetando sus dependencias:

```text
Users
  ↓
Languages
  ↓
Courses
```

- **Users** crea los usuarios iniciales de prueba.
- **Languages** carga los idiomas.
- **Courses** crea los cursos y sus unidades embebidas relacionadas con cada idioma.

<p><a href="#indice">Volver al índice</a></p>

<a id="conjugaciones-portuguesas"></a>
### 2. Conjugaciones portuguesas

```bash
npm run seed:ptverbs
```

Este seed debe ejecutarse **después de `seed:all`**, porque necesita que los cursos y sus unidades ya existan.

El dataset se importa desde CSV:

```text
CSV
 ↓
Node.js fs
 ↓
csv-parse
 ↓
validación
 ↓
resolución Course / Unit
 ↓
MongoDB
```

El seed transforma los códigos legibles del CSV en referencias válidas a cursos y unidades antes de insertar los documentos de `portugueseVerbConjugations`.

Secuencia completa:

```text
npm run seed:all
       ↓
Users → Languages → Courses
       ↓
npm run seed:ptverbs
       ↓
Portuguese Verb Conjugations
```

<p><a href="#indice">Volver al índice</a></p>

---

<a id="autenticacion"></a>
## Autenticación

El backend utiliza JWT y `bcrypt`.

Flujo principal:

```text
Login
 ↓
Backend valida credenciales
 ↓
JWT
 ↓
Frontend almacena el token
 ↓
ProtectedRoute
```

Al recargar la aplicación, `AuthProvider` consulta:

```text
GET /api/v1/auth/me
```

para comprobar el token y restaurar la sesión.

El backend también dispone de middleware `isAuth` y `isAdmin`. La interfaz administrativa queda fuera del alcance del MVP actual.

Probé el funcionamiento de la autenticación con pruebas de Insomnia, que se encuentran en la carpeta del mismo nombre como [Insomnia_User_CRUD](../insomnia/Insomnia_User_CRUD) (Backend)

<p><a href="#indice">Volver al índice</a></p>

---

<a id="api"></a>
## API

Recursos principales:

```text
/api/v1/auth
/api/v1/users
/api/v1/languages
/api/v1/courses
/api/v1/vocabulary
/api/v1/exercises
/api/v1/progress
/api/v1/portuguese-verb-conjugations
```

El frontend consume actualmente los endpoints necesarios para autenticación, navegación de idiomas/cursos/unidades y la actividad de conjugación.

Otros endpoints CRUD permanecen preparados para futuras fases, especialmente administración de contenido y progreso.

<p><a href="#indice">Volver al índice</a></p>

---

<a id="diseno-ux"></a>
## Diseño y UX

El diseño del MVP es deliberadamente sencillo.

Se ha priorizado:

- navegación clara;
- responsive;
- componentes reutilizables;
- separación modular;
- facilidad para modificar posteriormente la interfaz.

La intención es poder evolucionar la identidad visual y añadir un dashboard administrativo sin rehacer la arquitectura existente.

<p><a href="#indice">Volver al índice</a></p>

---

<a id="uso-inteligencia-artificial"></a>
## Uso de inteligencia artificial

Este es mi primer proyecto desarrollado con **TypeScript**. Durante el desarrollo utilicé herramientas de inteligencia artificial conversacional como apoyo para comprender el tipado, resolver dudas técnicas y orientarme en la construcción y revisión del código.

No utilicé agentes de codificación para generar o desarrollar automáticamente el proyecto. Utilicé **GitHub Copilot** de forma puntual para tareas auxiliares, principalmente para añadir índices y realizar revisiones básicas de errores.

Las decisiones sobre la arquitectura, estructura del proyecto, implementación y adaptación del código al alcance del MVP se realizaron y revisaron durante el proceso de desarrollo.

<p><a href="#indice">Volver al índice</a></p>

---

<a id="dashboard-progreso"></a>
## Dashboard y progreso

Las páginas de dashboard y progreso forman parte de la estructura del frontend. En la versión actual mostrada en los screenshots, el dashboard utiliza todavía datos de demostración.

La arquitectura backend ya incluye una colección `Progress`, pensada para evolucionar hacia seguimiento persistente del usuario y métricas de estudio.

Existe una carpeta [mocks](https://github.com/candytale55/fullstack-project-frontend/tree/main/src/mocks) en el frontend, que es donde se guardan todos los mocks iniciales que se usaron mientras construía el frontend con React, antes de ligar al backend. Actualmente solo dashboardMock.ts se está usando. 

<p><a href="#indice">Volver al índice</a></p>

---

<a id="evolucion-prevista"></a>
## Evolución prevista

El proyecto puede ampliarse con:

- nuevas actividades de aprendizaje;
- más contenido e idiomas;
- progreso persistente ampliado;
- mejoras de dashboard;
- administración de contenido;
- dashboard para administradores;
- evolución del diseño visual.

Estas ampliaciones no modifican el objetivo del MVP entregado: demostrar un flujo Full Stack funcional orientado al estudiante.

<p><a href="#indice">Volver al índice</a></p>

---