/**
 * Preferencias de presentación elegidas por el usuario (tema).
 *
 * Son datos **técnicos** que el usuario pide explícitamente, así que no necesitan consentimiento.
 * Se guardan en `localStorage`, clave `preferencias`, como JSON `{ tema }`.
 *
 * @module preferencias
 */

const CLAVE = 'preferencias';

/**
 * Tema guardado, o null si el usuario no ha elegido ninguno.
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {'claro'|'oscuro'|null}
 */
export function leerTema(almacen = globalThis.localStorage) {
  // TODO
  return null;
}

/**
 * Guarda el tema elegido.
 * @param {'claro'|'oscuro'} tema
 * @param {Storage} [almacen=globalThis.localStorage]
 */
export function guardarTema(tema, almacen = globalThis.localStorage) {
  // TODO
  // (sin valor de retorno)
}

/**
 * Tema que hay que aplicar: el elegido por el usuario o, si no eligió, el del sistema.
 * @param {'claro'|'oscuro'|null} elegido
 * @param {boolean} sistemaOscuro Si el sistema prefiere el modo oscuro.
 * @returns {'claro'|'oscuro'}
 */
export function temaAplicable(elegido, sistemaOscuro) {
  // TODO
  return 'claro';
}
