/**
 * Preferencias de presentación elegidas por el usuario (tema).
 *
 * Son datos **técnicos** que el usuario pide explícitamente, así que no necesitan consentimiento.
 * Se guardan en `localStorage`, clave `preferencias`, como JSON `{ tema }`.
 *
 * @module preferencias
 */

const CLAVE = 'preferencias';
const TEMAS = ['claro', 'oscuro'];

/**
 * Tema guardado, o null si el usuario no ha elegido ninguno.
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {'claro'|'oscuro'|null}
 */
export function leerTema(almacen = globalThis.localStorage) {
  try {
    const guardado = JSON.parse(almacen.getItem(CLAVE));
    // Un JSON roto, un valor que no es un tema o un almacenamiento que falla se tratan como «sin tema»
    return TEMAS.includes(guardado?.tema) ? guardado.tema : null;
  } catch {
    return null;
  }
}

/**
 * Guarda el tema elegido.
 * @param {'claro'|'oscuro'} tema
 * @param {Storage} [almacen=globalThis.localStorage]
 */
export function guardarTema(tema, almacen = globalThis.localStorage) {
  try {
    almacen.setItem(CLAVE, JSON.stringify({ tema }));
  } catch {
    // Si no se puede guardar, el tema solo dura mientras la página esté abierta: no es un error grave
  }
}

/**
 * Tema que hay que aplicar: el elegido por el usuario o, si no eligió, el del sistema.
 * @param {'claro'|'oscuro'|null} elegido
 * @param {boolean} sistemaOscuro Si el sistema prefiere el modo oscuro.
 * @returns {'claro'|'oscuro'}
 * @example
 * temaAplicable(null, true); // 'oscuro'
 */
export function temaAplicable(elegido, sistemaOscuro) {
  if (TEMAS.includes(elegido)) {
    return elegido;
  }
  return sistemaOscuro ? 'oscuro' : 'claro';
}
