# Correcciones tras el feedback

Este documento registra las correcciones aplicadas a partir de la revisión del proyecto.

| Fallo señalado | Solución aplicada | Archivos modificados |
| --- | --- | --- |
| Las escrituras de cursos, idiomas y ejercicios podían ejecutarse sin autenticar ni autorizar al usuario. | Las rutas `POST`, `PATCH`/`PUT` y `DELETE` exigen ahora `isAuth` seguido de `isAdmin`. Las escrituras de vocabulario ya contaban con esta protección. | Backend: `src/api/routes/courses.routes.ts`, `src/api/routes/languages.routes.ts`, `src/api/routes/exercises.routes.ts` |
| Las rutas heredadas de progreso exponían información de todos los alumnos y permitían operar sobre su progreso. | Las rutas personales `/me` conservan `isAuth`. El resto de rutas de progreso se reservan para administración con `isAuth` e `isAdmin`. | Backend: `src/api/routes/progress.routes.ts` |
| Varias páginas repetían el ciclo de carga, error y estado con `useEffect` y `try/catch/finally`. | Se creó `useFetch`, que centraliza `data`, `loading`, `error` y `refetch`. Las páginas mantienen sus reglas de negocio y usan el hook para cargar datos. | Frontend: `src/hooks/useFetch.ts`, `src/pages/LanguagesPage/LanguagePage.tsx`, `src/pages/CoursesPage/CoursesPage.tsx`, `src/pages/CoursePage/CoursePage.tsx`, `src/pages/UnitsPage/UnitsPage.tsx`, `src/pages/ExercisePage/ExercisePage.tsx` |
| `useProgress` duplicaba el ciclo de carga que ya cubre el hook genérico. | `useProgress` delega en `useFetch` sin cambiar su interfaz pública: `progress`, `loading` y `error`. | Frontend: `src/hooks/useProgress.ts` |
| Una URL con un curso válido pero un idioma distinto podía mostrar el curso y construir enlaces inconsistentes. | `CoursePage` valida que `course.languageId` coincida con el parámetro `languageId`, igual que `UnitsPage`. | Frontend: `src/pages/CoursePage/CoursePage.tsx` |

La implementación de ejercicios reutilizables para los tipos `multiple-choice`, `fill-blank` y `matching` queda fuera de esta corrección. La actividad funcional actual continúa siendo la conjugación de verbos portugueses.
