/**
 * Crear y leer cookies como texto. Las funciones no escriben en `document.cookie`:
 * devuelven o reciben el texto, para poder probarlas fuera del navegador.
 * @module cookies
 */

/**
 * Texto de una cookie listo para asignar a `document.cookie`.
 *
 * @param {string} nombre
 * @param {string} valor Se codifica con encodeURIComponent.
 * @param {object} [opciones]
 * @param {number} [opciones.maxAge] Segundos hasta que caduca. Sin él, es una cookie de sesión.
 * @param {string} [opciones.path='/']
 * @param {'Strict'|'Lax'|'None'} [opciones.sameSite='Lax']
 * @param {boolean} [opciones.secure=false]
 * @returns {string}
 * @example
 * crearCookie('idioma', 'es', { maxAge: 3600 }); // 'idioma=es; max-age=3600; path=/; SameSite=Lax'
 */
export function crearCookie(
  nombre,
  valor,
  { maxAge, path = '/', sameSite = 'Lax', secure = false } = {},
) {
  // TODO
  return '';
}

/**
 * Valor de una cookie, o null si no existe.
 *
 * @param {string} nombre
 * @param {string} [texto] Texto de las cookies; por defecto, `document.cookie`.
 * @returns {string|null}
 */
export function leerCookie(nombre, texto = globalThis.document?.cookie ?? '') {
  // TODO
  return '';
}
