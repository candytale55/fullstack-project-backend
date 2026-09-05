# Plan base del proyecto — MVP educativo

## 1. Objetivo general

Crear una aplicación educativa Full Stack para estudiar idiomas mediante vocabulario y diferentes actividades.

El MVP se desarrollará inicialmente con **un solo idioma/curso**, pero la arquitectura deberá permitir añadir posteriormente otros cursos o idiomas sin modificar la estructura principal.

Ejemplos futuros:

* Portugués
* Inglés
* Francés
* cursos especializados dentro de un mismo idioma

Un usuario se registra **una sola vez en la aplicación** y puede utilizar diferentes cursos.

El progreso y los resultados deben mantenerse separados para cada curso.

---

# 2. Repositorios

El proyecto se divide en **dos repositorios Git independientes**.

```text
fullstack-project-backend/
└── Backend Node + Express + TypeScript

fullstack-project-frontend/
└── Frontend React + TypeScript + Vite
```

Cada repositorio tendrá:

* su propio `package.json`
* su propio `.gitignore`
* su propio historial Git
* sus propias dependencias
* sus propios scripts
* su propia documentación cuando sea necesario
* su propio pipeline CI/CD cuando se implemente

No se utilizará una estructura monorepo.

---

# 3. Principios arquitectónicos

El proyecto debe mantenerse sencillo porque es un MVP, pero preparado para crecer.

Principios principales:

1. **Separación de responsabilidades.**
2. **Las reglas de negocio no pertenecen al frontend.**
3. **Los algoritmos se ejecutan en el backend.**
4. **La interfaz no debe depender directamente de cómo se almacenan los datos.**
5. **Las actividades deben poder reutilizarse con diferentes cursos.**
6. **El usuario pertenece a la aplicación, no a un idioma concreto.**
7. **Resultados y progreso siempre deben conservar el contexto del curso.**
8. Seguir principios de Clean Architecture cuando aporten claridad, sin introducir capas innecesarias para el MVP.

---

# 4. Modelo conceptual principal

```text
                         USER
                           │
                           │ autenticación única
                           ▼
                        COURSES
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         Portuguese      English      French
            Course        Course       Course
              │
              ▼
          Curriculum
              │
       ┌──────┼──────┐
       │      │      │
     Level   Unit   Lesson
              │
              ▼
          Vocabulary
              │
              ▼
       Content Selector
              │
              ▼
          ACTIVITIES
        ┌─────┼─────┐
        │     │     │
      Quiz  Word   Crossword
            Search
        │     │     │
        └─────┼─────┘
              ▼
         StudyResult
              │
        userId + courseId
              │
              ▼
           Progress
```

En el MVP únicamente se implementará el curso inicial necesario para el proyecto.

La estructura debe asumir desde el principio que pueden existir varios.

---

# 5. User

El usuario es global a toda la aplicación.

Modelo conceptual:

```text
User
├── id
├── name
├── email
├── password
└── role
```

Un usuario:

```text
User
 │
 ├── Portuguese
 │     └── Progress Portuguese
 │
 ├── English
 │     └── Progress English
 │
 └── French
       └── Progress French
```

No debe existir un registro independiente por idioma.

---

# 6. Course

`Course` será el agrupador superior del contenido educativo.

No debe confundirse necesariamente con `Language`.

Ejemplos posibles:

```text
Portuguese
English
French
```

Pero posteriormente podrían existir:

```text
Portuguese General
Portuguese Business
English C1
English Academic Writing
```

Modelo conceptual inicial:

```text
Course
├── id
├── slug
├── name
├── language
└── active
```

Para el MVP se utilizará solamente uno.

---

# 7. Currículo

Cada curso puede organizar su contenido mediante:

```text
Course
└── Curriculum
     └── Level
          └── Unit
               └── Lesson
```

No es obligatorio crear inmediatamente una colección independiente para cada uno de estos niveles.

El MVP puede utilizar una estructura más sencilla mediante etiquetas curriculares mientras se mantiene esta jerarquía conceptual.

Ejemplo:

```text
A1
A1::Unit-01
A1::Unit-01::Lesson-03
```

Las etiquetas curriculares deben mantenerse separadas de las etiquetas semánticas.

---

# 8. Vocabulary

Todo vocabulario debe pertenecer a un curso.

Modelo conceptual:

```text
Vocabulary
├── id
├── slug
├── courseId
├── word
├── translation
├── curriculumTags[]
├── semanticTags[]
├── relations[]
├── createdAt
└── updatedAt
```

Ejemplo conceptual:

```text
Course: Portuguese

água
├── curriculum: A1::Unit-02
└── semantic: food, drinks
```

Una búsqueda de contenido debe incluir siempre el curso correspondiente.

```text
courseId + filtros
```

Esto evita mezclar vocabulario de distintos idiomas.

---

# 9. Relaciones entre palabras

Algunas relaciones no deben tratarse simplemente como etiquetas.

Ejemplo:

```text
stranger
outsider
immigrant
emigrant
```

pueden pertenecer a una relación:

```text
type: easily-confused
group: migration-terms
```

Para el MVP puede utilizarse una representación sencilla.

No es necesario crear todavía un sistema avanzado de relaciones entre vocabulario.

---

# 10. Importación de vocabulario

Se utilizará el vocabulario existente en CSV/TSV como base para poblar MongoDB.

Flujo:

```text
CSV / TSV
    ↓
parsear
    ↓
validar
    ↓
normalizar
    ↓
asignar courseId
    ↓
procesar etiquetas
    ↓
detectar duplicados
    ↓
guardar
```

La importación debe conocer siempre a qué `Course` pertenece el contenido.

---

# 11. Actividades

Las actividades son reutilizables.

Ejemplos:

```text
Quiz
Word Search
Crossword
```

No existirán:

```text
PortugueseWordSearch
EnglishWordSearch
```

Existirá:

```text
WordSearch
```

que recibe contenido perteneciente al curso seleccionado.

Ejemplo:

```text
Course
   ↓
Vocabulary
   ↓
Content Selector
   ↓
WordSearch
```

---

# 12. Reglas de negocio

Toda lógica funcional importante pertenece al backend.

Ejemplos:

```text
seleccionar vocabulario
generar crucigrama
generar sopa de letras
generar quiz
decidir respuestas correctas
validar respuestas
calcular resultados
calcular progreso
```

El frontend no debe reproducir estas reglas.

Flujo general:

```text
Frontend
   │
   │ request
   ▼
Backend
   │
   ├── reglas de negocio
   ├── servicios
   ├── algoritmos
   └── persistencia
   │
   ▼
Frontend
```

El frontend presenta el resultado y captura la interacción del usuario.

---

# 13. StudyResult

Cada actividad genera un resultado.

Modelo conceptual:

```text
StudyResult
├── userId
├── courseId
├── activityType
├── vocabularyIds[]
├── correct
├── incorrect
├── total
└── createdAt
```

La combinación:

```text
userId + courseId
```

es fundamental.

Los resultados de Portugués y de Inglés nunca deben mezclarse accidentalmente.

---

# 14. Progress

El progreso se calcula inicialmente a partir de `StudyResult`.

Métricas básicas del MVP:

```text
actividades realizadas
palabras estudiadas
respuestas correctas
respuestas incorrectas
accuracy
última actividad
```

Siempre filtradas por:

```text
userId + courseId
```

No se implementarán inicialmente:

```text
spaced repetition
mastery avanzado
recomendaciones automáticas
streaks complejos
algoritmos adaptativos
```

Podrán añadirse posteriormente.

---

# 15. Backend

Tecnologías previstas:

```text
Node.js
Express
TypeScript
MongoDB
Mongoose
```

La estructura concreta seguirá principalmente la arquitectura enseñada en el curso.

Como referencia conceptual deberá permitir separar:

```text
routes
controllers
models
middlewares
services / lógica funcional
utils
```

y cualquier otra carpeta exigida o utilizada por la arquitectura del curso.

Lo importante arquitectónicamente es mantener separadas:

```text
HTTP
datos
reglas de negocio
algoritmos
persistencia
```

No es necesario diseñar ahora una arquitectura backend más compleja.

---

# 16. Frontend

Tecnologías iniciales:

```text
React
TypeScript
Vite
CSS Modules
```

Estructura inicial sencilla:

```text
frontend/
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── eslint.config.js
├── vite.config.ts
├── tsconfig...
└── package.json
```

No se añadirá por ahora una arquitectura frontend más profunda.

Las carpetas se ampliarán cuando aparezcan funcionalidades reales.

Responsabilidades:

```text
components → presentación reutilizable

pages → páginas principales

context → estado global necesario

hooks → lógica React reutilizable

services → comunicación con backend

types → tipos TypeScript

utils → utilidades puramente de frontend

styles → estilos globales
```

Las reglas del dominio educativo no deben aparecer en estas carpetas.

---

# 17. Contextos principales del frontend

Conceptualmente habrá dos contextos diferentes.

```text
AuthContext
└── currentUser
```

responde:

```text
¿Quién está utilizando la aplicación?
```

Y:

```text
CourseContext
└── currentCourse
```

responde:

```text
¿Qué curso está estudiando actualmente?
```

Cambiar de curso no implica volver a iniciar sesión.

---

# 18. Flujo principal del MVP

```text
Login
  ↓
Course
  ↓
Vocabulary
  ↓
selección de contenido
  ↓
Activity
  ↓
StudyResult
  ↓
Progress
```

Para el primer curso:

```text
Login
  ↓
Portuguese
  ↓
Vocabulary
  ↓
Activity
  ↓
StudyResult
  ↓
Portuguese Progress
```

Cuando exista otro curso:

```text
                    User
                      │
             ┌────────┴────────┐
             │                 │
        Portuguese          English
             │                 │
          Activity           Activity
             │                 │
          Results            Results
             │                 │
        Progress PT        Progress EN
```

---

# 19. Orden inicial de desarrollo

## Fase 1 — Base del proyecto

1. Crear los dos repositorios.
2. Crear frontend con Vite + React + TypeScript.
3. Crear estructura básica definitiva del frontend.
4. Crear backend con Node + Express + TypeScript según la arquitectura del curso.
5. Configurar variables de entorno y conexión a MongoDB.

No instalar herramientas adicionales hasta que sean necesarias.

---

## Fase 2 — Modelo de dominio

Definir primero:

```text
User
Course
Vocabulary
StudyResult
```

y sus relaciones.

Después definir:

```text
curriculumTags
semanticTags
relations
```

---

## Fase 3 — Datos

1. Crear el primer `Course`.
2. Preparar CSV/TSV.
3. Normalizar vocabulario.
4. Importar al curso correspondiente.
5. Validar duplicados y relaciones básicas.

---

## Fase 4 — API básica

Implementar primero las operaciones necesarias para:

```text
Auth
Courses
Vocabulary
```

El objetivo será poder:

```text
identificar usuario
      ↓
seleccionar curso
      ↓
obtener vocabulario del curso
```

---

## Fase 5 — Primera actividad

Implementar una actividad sencilla.

Flujo:

```text
Frontend solicita actividad
          ↓
Backend selecciona vocabulario
          ↓
Backend aplica reglas/algoritmo
          ↓
Frontend recibe actividad
          ↓
Usuario interactúa
          ↓
Frontend envía respuesta
          ↓
Backend evalúa
```

---

## Fase 6 — Resultados

Crear `StudyResult`.

Cada resultado debe registrar:

```text
user
course
actividad
contenido
resultado
fecha
```

---

## Fase 7 — Progreso

Crear seguimiento básico por:

```text
userId + courseId
```

Mostrar las primeras estadísticas en frontend.

---

## Fase 8 — Segunda actividad

Una vez probado todo el flujo completo:

```text
contenido
→ actividad
→ resultado
→ progreso
```

añadir otra actividad reutilizando la infraestructura existente.

---

## Fase 9 — Testing

Añadir tests cuando ya exista lógica que tenga sentido probar.

Prioridad:

```text
reglas de negocio
algoritmos
servicios importantes
endpoints críticos
```

Vitest u otras herramientas no se instalarán antes de necesitarlas.

---

## Fase 10 — CI/CD

Cuando existan:

```text
lint
tests
build
```

crear GitHub Actions en cada repositorio según corresponda.

---

## Fase 11 — Documentación y entrega

Mantener documentación progresiva sobre:

```text
arquitectura
modelo de datos
importación
actividades
seguimiento
testing
requisitos del proyecto
```

Finalmente:

```text
deploy backend
deploy frontend
configurar variables
verificar flujo completo
```

---

# 20. Límite del MVP

El MVP se considera completo cuando existe al menos este flujo:

```text
Usuario
   ↓
Login
   ↓
Curso
   ↓
Vocabulario
   ↓
Actividad
   ↓
Resultado
   ↓
Progreso del curso
```

No es necesario implementar múltiples idiomas durante el MVP.

Sí es obligatorio que la arquitectura permita:

```text
User
 ├── Course A
 │    └── Progress A
 │
 └── Course B
      └── Progress B
```

sin duplicar usuarios ni mezclar resultados.

---

# 21. Ampliaciones posteriores

La arquitectura debe permitir incorporar posteriormente:

```text
más idiomas
más cursos
más niveles
más unidades
más tipos de actividad
palabras relacionadas
palabras fácilmente confundibles
gramática
pronunciación
flashcards
spaced repetition
dificultad adaptativa
recomendaciones
IA generativa
tutor IA
estadísticas avanzadas
```

Estas funcionalidades no forman parte de la base necesaria para comenzar el MVP.

---

# Arquitectura de referencia

La relación que debe mantenerse durante el desarrollo es:

```text
                         USER
                           │
                           ▼
                         COURSE
                           │
                    ┌──────┴──────┐
                    │             │
               Curriculum     Vocabulary
                    │             │
                    └──────┬──────┘
                           ▼
                  Content Selection
                           │
                           ▼
                     Activity
                           │
                           ▼
                     StudyResult
                           │
                    user + course
                           │
                           ▼
                       Progress
```

Y la separación técnica fundamental:

```text
FRONTEND
presentación + interacción
            │
            ▼
           API
            │
            ▼
BACKEND
reglas de negocio
algoritmos
validación
persistencia
            │
            ▼
DATABASE
```
