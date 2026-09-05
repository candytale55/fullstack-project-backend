# Dependencias del backend


## Dependencias de producción:

- **express**: framework web para crear el servidor HTTP, definir rutas y middlewares.
- **mongoose**: ODM para MongoDB; permite definir modelos/esquemas y conectar con la base de datos.
- **dotenv**: carga las variables de entorno desde el archivo `.env`.

## Dependencias de desarrollo

### Por TypeScript
- **typescript**: compila TypeScript a JavaScript (`npm run build`).
- **tsx**: ejecuta archivos `.ts` directamente sin compilar; usa esbuild internamente, es más rápido y compatible con TypeScript 7 (reemplaza a ts-node).
- **@types/node**: tipos de TypeScript para las APIs de Node.js (process, fs, etc.).
- **@types/express**: tipos de TypeScript para Express (Request, Response, etc.).

### Otras herramientas de desarrollo
- **nodemon**: reinicia el servidor automáticamente cuando cambias archivos (`npm run dev`).