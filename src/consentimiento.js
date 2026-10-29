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
 * @example
 * crearConsentimiento({ analitica: true }, new Date('2025-01-15T10:00:00Z'));
 * // { version: 1, analitica: true, personalizacion: false, fecha: '2025-01-15T10:00:00.000Z' }
 */
export function crearConsentimiento(
  { analitica = false, personalizacion = false },
  ahora = new Date(),
) {
  // Solo un true de verdad cuenta como «aceptado»: 'si', 1 o 'true' se rechazan
  return {
    version: VERSION,
    analitica: analitica === true,
    personalizacion: personalizacion === true,
    fecha: ahora.toISOString(),
  };
}

/**
 * Indica si un registro es válido y no ha caducado.
 * @param {Consentimiento|null} registro
 * @param {Date} [ahora=new Date()]
 * @returns {boolean}
 * @example
 * // Decidido el 15/01/2025 a las 10:00: vigente hasta las 9:59 del 15/01/2026
 */
export function consentimientoVigente(registro, ahora = new Date()) {
  if (registro === null || typeof registro !== 'object' || registro.version !== VERSION) {
    return false;
  }
  const fecha = new Date(registro.fecha);
  if (Number.isNaN(fecha.getTime())) {
    return false;
  }
  const caducidad = new Date(fecha);
  caducidad.setMonth(caducidad.getMonth() + CADUCIDAD_MESES);
  // Vigente hasta el último instante antes de la caducidad; en la caducidad exacta ya no
  return ahora < caducidad;
}

/**
 * Lee el registro guardado.
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {Consentimiento|null} null si no hay nada o el valor está corrupto.
 */
export function leerConsentimiento(almacen = globalThis.localStorage) {
  try {
    const texto = almacen.getItem(CLAVE);
    if (texto === null) {
      return null;
    }
    const registro = JSON.parse(texto);
    return registro !== null && typeof registro === 'object' && !Array.isArray(registro)
      ? registro
      : null;
  } catch {
    // JSON roto o almacenamiento que lanza un error (modo privado, bloqueado…)
    return null;
  }
}

/**
 * Guarda el registro.
 * @param {Consentimiento} registro
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {boolean} false si no se ha podido guardar.
 */
export function guardarConsentimiento(registro, almacen = globalThis.localStorage) {
  try {
    almacen.setItem(CLAVE, JSON.stringify(registro));
    return true;
  } catch {
    // Almacenamiento lleno o no disponible
    return false;
  }
}

/**
 * Frase que resume la decisión del usuario.
 * @param {Consentimiento|null} registro
 * @returns {string} Por ejemplo, «Cookies aceptadas: técnicas y analítica (15 de enero de 2025)».
 */
export function textoResumen(registro) {
  if (registro === null) {
    return 'Aún no has decidido sobre las cookies.';
  }
  const aceptadas = ['técnicas'];
  if (registro.analitica) aceptadas.push('analítica');
  if (registro.personalizacion) aceptadas.push('personalización');

  const lista = new Intl.ListFormat('es-ES', { style: 'long', type: 'conjunction' });
  const fecha = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(
    new Date(registro.fecha),
  );
  const soloTecnicas = aceptadas.length === 1;
  return `Cookies aceptadas: ${soloTecnicas ? 'solo ' : ''}${lista.format(aceptadas)} (${fecha})`;
}
