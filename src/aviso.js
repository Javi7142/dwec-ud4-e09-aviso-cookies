/**
 * Aviso de cookies con <dialog>. Es la única parte que toca el DOM y `document.cookie`.
 *
 * Guarda: el consentimiento en `localStorage` (clave `consentimiento`, con su fecha de caducidad);
 * la cookie `consentimiento` (valor `analitica` o `tecnicas`, un año); y en `sessionStorage` la
 * clave `aviso-aplazado` cuando el usuario decide más tarde (solo vale para esta pestaña).
 * @module aviso
 */
import { crearCookie } from './cookies.js';
import { crearConsentimiento, guardarConsentimiento } from './consentimiento.js';

const CLAVE_APLAZADO = 'aviso-aplazado';
const UN_ANIO_EN_SEGUNDOS = 365 * 24 * 60 * 60;

const dialogo = document.querySelector('#aviso-cookies');
const casillaAnalitica = dialogo.querySelector('input[name="analitica"]');
const casillaPersonalizacion = dialogo.querySelector('input[name="personalizacion"]');

// Oyente de cierre de la última vez: se quita antes de poner otro, para que nunca se acumulen
let alCerrar = null;

/**
 * Indica si el usuario ha aplazado la decisión en esta pestaña.
 *
 * @returns {boolean}
 */
export function avisoAplazado() {
  try {
    return sessionStorage.getItem(CLAVE_APLAZADO) === 'si';
  } catch {
    return false;
  }
}

/**
 * Anota (o borra) en `sessionStorage` que la decisión se ha aplazado en esta pestaña.
 *
 * @param {boolean} aplazado
 */
function marcarAplazado(aplazado) {
  try {
    if (aplazado) {
      sessionStorage.setItem(CLAVE_APLAZADO, 'si');
    } else {
      sessionStorage.removeItem(CLAVE_APLAZADO);
    }
  } catch {
    // Sin sessionStorage no se puede recordar el aplazamiento: se volverá a preguntar al recargar
  }
}

/**
 * Registro de la decisión según el botón con el que se ha cerrado el diálogo, o `null` si no
 * es una decisión (Decidir más tarde o `Esc`).
 *
 * @param {string} boton `returnValue` del diálogo.
 * @returns {import('./consentimiento.js').Consentimiento|null}
 */
function decisionDe(boton) {
  switch (boton) {
    case 'aceptar':
      return crearConsentimiento({ analitica: true, personalizacion: true });
    case 'rechazar':
      return crearConsentimiento({ analitica: false, personalizacion: false });
    case 'guardar':
      return crearConsentimiento({
        analitica: casillaAnalitica.checked,
        personalizacion: casillaPersonalizacion.checked,
      });
    default:
      return null;
  }
}

/**
 * Abre el aviso de cookies como diálogo modal. Al cerrarse con una decisión, guarda el
 * consentimiento y la cookie y llama a `alDecidir(registro)`; con «Decidir más tarde» o `Esc`
 * no guarda nada, anota que se ha aplazado y llama a `alDecidir(null)`.
 *
 * @param {import('./consentimiento.js').Consentimiento|null} anterior Decisión anterior, para
 *   marcar las casillas (o `null` si no hay).
 * @param {(registro: import('./consentimiento.js').Consentimiento|null) => void} alDecidir
 * @returns {void}
 */
export function mostrarAviso(anterior, alDecidir) {
  casillaAnalitica.checked = anterior?.analitica === true;
  casillaPersonalizacion.checked = anterior?.personalizacion === true;

  // returnValue conserva el valor de la última vez: se borra para que Esc no cuente como la decisión anterior
  dialogo.returnValue = '';
  dialogo.removeEventListener('close', alCerrar);
  alCerrar = () => {
    const registro = decisionDe(dialogo.returnValue);
    if (registro === null) {
      marcarAplazado(true);
      alDecidir(null);
      return;
    }
    marcarAplazado(false);
    guardarConsentimiento(registro);
    // Cookie con el nivel de consentimiento: Secure solo si la página va por HTTPS
    document.cookie = crearCookie('consentimiento', registro.analitica ? 'analitica' : 'tecnicas', {
      maxAge: UN_ANIO_EN_SEGUNDOS,
      sameSite: 'Lax',
      secure: location.protocol === 'https:',
    });
    alDecidir(registro);
  };
  dialogo.addEventListener('close', alCerrar, { once: true });
  dialogo.showModal();
}
