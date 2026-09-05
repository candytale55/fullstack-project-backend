# 🧿 Fullstack Project Backend

Backend del proyecto educativo Full Stack desarrollado como proyecto final de ThePower.

La aplicación permitirá a los usuarios estudiar vocabulario mediante diferentes actividades y mantener un seguimiento básico de sus resultados y progreso por curso.

## Tecnologías

* Node.js
* Express
* TypeScript
* MongoDB
* Mongoose

## Objetivo del backend

El backend será responsable de:

* autenticación de usuarios
* gestión de cursos
* gestión de vocabulario
* selección de contenido para actividades
* ejecución de reglas de negocio y algoritmos
* validación de respuestas
* almacenamiento de resultados
* cálculo del progreso por usuario y curso

## Estructura

La arquitectura se mantendrá sencilla y se ampliará conforme avance el MVP.

La estructura base separará principalmente:

```text
routes
controllers
models
middlewares
services
utils
```

Las reglas de negocio y los algoritmos se mantendrán separados de la capa HTTP siempre que aporte claridad al proyecto.

## Proyecto

Este repositorio contiene únicamente el **backend**.

El frontend se desarrolla en un repositorio Git independiente:

```text
fullstack-project-frontend
```

## Estado

Proyecto en desarrollo.

La documentación se irá ampliando progresivamente conforme se implementen las diferentes fases del MVP.
