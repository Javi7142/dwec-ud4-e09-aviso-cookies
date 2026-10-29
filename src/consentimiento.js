/**
 * Consentimiento de cookies del usuario.
 *
 * Se guarda en `localStorage`, clave `consentimiento`, como JSON
 * `{ version, analitica, personalizacion, fecha }` (`fecha` en formato ISO). Caduca a los
 * CADUCIDAD_MESES: después hay que volver a preguntar. Las funciones reciben el almacenamiento
 * y la fecha actual como parámetros, con los reales por defecto.
 *
 * @module consentimiento
 */

/** Versión del formato guardado: si cambian las categorías, se sube y se vuelve a preguntar. */
export const VERSION = 1;
/** Meses que dura el consentimiento. */
export const CADUCIDAD_MESES = 12;
const CLAVE = 'consentimiento';

/**
 * Registro del consentimiento.
 * @typedef {object} Consentimiento
 * @property {number} version
 * @property {boolean} analitica
 * @property {boolean} personalizacion
 * @property {string} fecha Fecha de la decisión en formato ISO.
 */

/**
 * Crea el registro de una decisión del usuario.
 * @param {{ analitica?: boolean, personalizacion?: boolean }} opciones Lo que no se indica, se rechaza.
 * @param {Date} [ahora=new Date()]
 * @returns {Consentimiento}
 */
export function crearConsentimiento(
  { analitica = false, personalizacion = false },
  ahora = new Date(),
) {
  // TODO
  return null;
}

/**
 * Indica si un registro es válido y no ha caducado.
 * @param {Consentimiento|null} registro
 * @param {Date} [ahora=new Date()]
 * @returns {boolean}
 */
export function consentimientoVigente(registro, ahora = new Date()) {
  // TODO
  return false;
}

/**
 * Lee el registro guardado.
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {Consentimiento|null} null si no hay nada o el valor está corrupto.
 */
export function leerConsentimiento(almacen = globalThis.localStorage) {
  // TODO
  return null;
}

/**
 * Guarda el registro.
 * @param {Consentimiento} registro
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {boolean} false si no se ha podido guardar.
 */
export function guardarConsentimiento(registro, almacen = globalThis.localStorage) {
  // TODO
  return false;
}

/**
 * Frase que resume la decisión del usuario.
 * @param {Consentimiento|null} registro
 * @returns {string} Por ejemplo, «Cookies aceptadas: técnicas y analítica (15 de marzo de 2025)».
 */
export function textoResumen(registro) {
  // TODO
  return '';
}
