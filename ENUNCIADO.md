# E09 · Aviso de cookies y preferencias

**Tipo:** corrección por IA

Programa el aviso de cookies de la web de una librería: pide el consentimiento con un `<dialog>`, lo guarda en el navegador con su fecha de caducidad, activa la analítica **solo** si el usuario la acepta y recuerda el tema elegido. Las funciones que no tocan el DOM se prueban con Vitest usando dobles de prueba y mocks.

**CE:** RA3 c, d, e, g, h

## Entorno de trabajo

Este ejercicio trae su Dev Container en `.devcontainer/`. Como los ejercicios de la UD2 con dependencias de npm, **construye su imagen** con el `Dockerfile` de esa carpeta, a partir de la imagen oficial de Node.js de **Docker Hub**, `node:24-bookworm` (UD2, tema 9, apartado 9.3.2). Abre en VS Code **la carpeta del ejercicio**, la que contiene `.devcontainer/` (no una carpeta superior, como la del repositorio del curso: VS Code solo busca el Dev Container en la carpeta que abres), y ejecuta **Dev Containers: Reopen in Container**. Si VS Code te ofrece crear una configuración nueva, es que has abierto otra carpeta. La primera vez tarda algo más, porque descarga la imagen y la construye. Al crearse, el contenedor ejecuta `npm install`: cuando se abre, las dependencias ya están instaladas.

La página usa módulos, así que necesita un servidor: no la abras con doble clic. Al abrir el contenedor, VS Code arranca solo el servidor de la página (`serve`, en el puerto 3409) y abre <http://localhost:3409> en el navegador de tu equipo. Si no se abre, búscala en el panel **Puertos** de VS Code: la columna **Dirección reenviada** da la dirección exacta (si el 3409 de tu equipo ya está ocupado, VS Code usa otro número). Si paras el servidor, vuelve a lanzarlo en la terminal del contenedor con `npx --yes serve@14.2.6 --listen 3409 .`.

Ejecuta los tests, ESLint y Prettier en la terminal de VS Code, que ya es la del contenedor.

## Punto de partida

```text
├── package.json          ← scripts test, lint, format y format:check
├── index.html            ← la página con el <dialog> del aviso (no hace falta cambiarla)
├── estilos.css           ← colores por tema con variables CSS
├── src/
│   ├── cookies.js        ← crearCookie y leerCookie, sin programar
│   ├── consentimiento.js ← cinco funciones, sin programar
│   ├── preferencias.js   ← tres funciones, sin programar
│   ├── aviso.js          ← vacío
│   └── main.js           ← vacío
├── tests/
│   ├── AlmacenFalso.js   ← doble de prueba de localStorage
│   └── cookies.test.js   ← un primer test
└── README.md             ← plantilla de entrega
```

No hay `npm start`: es una página web, y el Dev Container la sirve en el puerto 3409.

## Requisitos

**Funciones sin DOM** (`cookies.js`, `consentimiento.js`, `preferencias.js`): prográmalas según su JSDoc y el contrato. Reciben el almacenamiento y la fecha actual como **parámetros con valor por defecto** (`globalThis.localStorage`, `new Date()`), para poder probarlas en Node.js.

1. `crearCookie` devuelve el **texto** de una cookie (no escribe en `document.cookie`), con el valor codificado. `leerCookie` busca una cookie en un texto, por su nombre **exacto**.
2. `crearConsentimiento` crea el registro `{ version, analitica, personalizacion, fecha }`: lo que no se indica (o no es exactamente `true`) se rechaza.
3. `consentimientoVigente` es `false` si el registro no existe, es de otra versión, tiene una fecha no válida o han pasado `CADUCIDAD_MESES` desde la fecha.
4. `leerConsentimiento` y `leerTema` toleran un valor ausente o corrupto (devuelven `null`). `guardarConsentimiento` devuelve `false` si el almacenamiento falla.
5. `textoResumen` redacta la decisión con `Intl.ListFormat` e `Intl.DateTimeFormat`.

**La página** (`aviso.js` y `main.js`):

6. **Tema** (`main.js`): al cargar, el tema guardado o, si no hay, el del sistema (`matchMedia`), aplicado con `data-tema` en `<html>`. El botón cambia el tema, lo guarda y cambia su texto. Sin estilos en el JavaScript.
7. **Aviso** (`aviso.js`): `mostrarAviso(anterior, alDecidir)` abre el `<dialog>` con `showModal()`, con las casillas marcadas según la decisión anterior, y al cerrarse:
   - **Aceptar todas**, **Rechazar** o **Guardar selección**: crea y guarda el registro, escribe la cookie `consentimiento` (valor `analitica` o `tecnicas`, un año, `SameSite=Lax` y `Secure` si la página es HTTPS) y llama a `alDecidir(registro)`.
   - **Decidir más tarde** o `Esc`: no guarda nada, anota en `sessionStorage` que se ha aplazado y llama a `alDecidir(null)`.
   - `avisoAplazado()` indica si se aplazó en esta pestaña.
8. **Al cargar** (`main.js`): si no hay un consentimiento vigente y no se ha aplazado en esta pestaña, muestra el aviso. El enlace «Configurar cookies» lo vuelve a abrir siempre.
9. Escribe en `#resumen-cookies` el texto de `textoResumen` (con `textContent`).
10. **Analítica**: solo si el consentimiento vigente la acepta, muestra **una vez** en la consola `📊 Analítica activada (simulada)`. Nada que no sea técnico se activa antes de la decisión.
11. Ningún `alert`, `confirm` ni `prompt`.

**Pruebas y documentación**:

12. Tests de las tres funciones sin DOM, con `AlmacenFalso`: casos normales, límite (el último instante antes de caducar y el primero después) y erróneos (corrupto, otra versión, almacenamiento lleno). Al menos un test con `vi.useFakeTimers()` y `vi.setSystemTime()` (deshecho en `afterEach`) y uno con `vi.fn()`.
13. JSDoc en todas las funciones exportadas, incluido qué guarda cada módulo y con qué clave.
14. `npm test`, `npm run lint` y `npm run format:check` sin errores.
15. Completa el `README.md` y haz commits frecuentes con mensajes descriptivos.

## Contrato de entrega

| Elemento | Debe ser |
|----------|----------|
| Ficheros | Los de `src/` y `tests/` del punto de partida (y los tests que añadas), `index.html`, `estilos.css`, `README.md` |
| `crearCookie(nombre, valor, { maxAge, path = '/', sameSite = 'Lax', secure = false } = {})` | `crearCookie('idioma', 'es')` → `'idioma=es; path=/; SameSite=Lax'`; con `maxAge: 60, sameSite: 'Strict', secure: true` → `'…; max-age=60; path=/; SameSite=Strict; Secure'` |
| `leerCookie(nombre, texto = document.cookie)` | Con `'idioma=es; nombre=Ana%20Garc%C3%ADa'`: `'nombre'` → `'Ana García'`; `'idi'` → `null` |
| `crearConsentimiento(opciones, ahora = new Date())` | `{ version: 1, analitica, personalizacion, fecha: ahora.toISOString() }` |
| `consentimientoVigente(registro, ahora = new Date())` | Decidido el 15/01/2025 a las 10:00: vigente hasta el 15/01/2026 a las 9:59, caducado desde las 10:00 |
| `leerConsentimiento(almacen)` / `guardarConsentimiento(registro, almacen)` | Clave `consentimiento`, JSON |
| `textoResumen(registro)` | `'Cookies aceptadas: técnicas y analítica (15 de enero de 2025)'`; con `null`, `'Aún no has decidido sobre las cookies.'` |
| `leerTema(almacen)` / `guardarTema(tema, almacen)` / `temaAplicable(elegido, sistemaOscuro)` | Clave `preferencias`, JSON `{ tema }`. `temaAplicable(null, true)` → `'oscuro'` |
| `aviso.js` | Exporta `mostrarAviso(anterior, alDecidir)` y `avisoAplazado()` |
| Secciones del README | `## Cómo ejecutarlo`, `## Qué se guarda y dónde`, `## Privacidad`, `## Interacción`, `## Pruebas`, `## Depuración`, `## Herramientas` |
| Integración continua | **Opcional**: `.github/workflows/ci.yml`, `package-lock.json` y la sección `## Integración continua (opcional)` del README. No se corrige |

## Criterios de evaluación

- ✅ El tema cambia el aspecto con atributos y variables CSS, respetando el sistema y la elección del usuario
- ✅ Los textos se generan con `Intl` y se insertan de forma segura
- ✅ El aviso usa `<dialog>` con todas las opciones, accesible y reabrible
- ✅ Cada dato se guarda en el mecanismo adecuado, con lectura tolerante a errores
- ✅ Nada no técnico se activa sin consentimiento, que caduca y se renueva
- ✅ Tests con dobles de prueba y mocks de fecha y funciones
- ✅ JSDoc, sesión de depuración en el panel Aplicación, ESLint y Prettier
- ✅ Historial de commits progresivo y con mensajes descriptivos

## Integración continua (opcional)

> 📝 Este apartado es **opcional** y no cuenta para la corrección. Hazlo si en clase habéis visto GitHub Actions; si no, sáltatelo.

Tu repositorio de la tarea ya está en GitHub. Escribe un *workflow* de GitHub Actions que pase **todas las comprobaciones del proyecto** cada vez que subas cambios. Es como el de la UD2, con una mejora: las dependencias se instalan con **`npm ci`** a partir de `package-lock.json`, el fichero que anota la versión exacta de cada paquete instalado. Así la integración continua usa las mismas versiones que tu contenedor, y con la caché de npm la instalación es más rápida. Escríbelo tú, en `.github/workflows/ci.yml`, con estas orientaciones:

- Se ejecuta con cada `push` y cada *pull request* a la rama `main`.
- Tiene un único trabajo (*job*) que se ejecuta en `ubuntu-latest`.
- Sus pasos, en este orden, cada uno con un nombre (`name`) en español que diga qué hace:
  1. Descargar el código, con la acción `actions/checkout@v7`.
  2. Instalar Node.js 24 con la caché de npm, con la acción `actions/setup-node@v7`, `node-version: 24` y `cache: npm`.
  3. Instalar las dependencias con `npm ci`.
  4. Revisar el código con ESLint: `npm run lint`.
  5. Comprobar el formato con Prettier: `npm run format:check`.
  6. Ejecutar los tests: `npm test`.
- Sube también `package-lock.json`: lo creó `npm install` al abrir el contenedor. Sin él, `npm ci` falla. Si añades o actualizas una dependencia, vuelve a subirlo.
- Prettier también revisa el formato de `ci.yml`: ejecuta `npm run format` antes de subirlo.

Compruébalo:

1. Sube los cambios y abre la pestaña **Actions** del repositorio: la ejecución debe salir en verde, con los seis pasos.
2. Rompe algo a propósito (por ejemplo, cambia el texto esperado de un test de `crearCookie`), sube el cambio y comprueba que la ejecución sale en rojo en el paso que corresponde. Después, deshaz el cambio y comprueba que vuelve a verde.

Deja constancia en la sección «Integración continua (opcional)» del `README.md`: el enlace a la ejecución en verde y dos capturas en `img/`, una de la ejecución en verde con sus pasos y otra de la ejecución en rojo con el paso que falla.

## Al terminar

Cuando acabes la práctica, **borra su contenedor**. Si no, sigue en marcha ocupando memoria, y se acumula uno por cada ejercicio (UD1, tema 5, apartado 5.4.7). Tu trabajo no se borra: está en la carpeta del ejercicio.

1. Cierra la ventana de VS Code del ejercicio.
2. En una terminal de tu equipo (en Windows, PowerShell), borra todos los contenedores de Dev Containers. La orden solo toca los que ha creado VS Code, no otros contenedores que tengas:

   ```bash
   docker rm -f $(docker ps -aq --filter label=devcontainer.local_folder)
   ```

   Si no queda ninguno, Docker avisa de que le falta un argumento: puedes ignorarlo. También puedes borrarlos desde Docker Desktop, en la pestaña **Containers**.

La imagen que ha construido el `Dockerfile` tampoco se borra (se llama `vsc-` seguido del nombre de la carpeta), así que la próxima vez no hace falta construirla de nuevo. Si necesitas espacio, bórrala desde la pestaña **Images** de Docker Desktop o con `docker image rm <nombre>`.
