// E09 · Librería La Hoja: tema, aviso de cookies y analítica según el consentimiento
import { leerTema, guardarTema, temaAplicable } from './preferencias.js';
import { consentimientoVigente, leerConsentimiento, textoResumen } from './consentimiento.js';
import { mostrarAviso, avisoAplazado } from './aviso.js';

const raiz = document.documentElement;
const botonTema = document.querySelector('#cambiar-tema');
const textoResumenCookies = document.querySelector('#resumen-cookies');

// 6. Tema: el guardado o, si no hay, el del sistema. Se aplica con data-tema, sin estilos en JavaScript
const sistemaOscuro = matchMedia('(prefers-color-scheme: dark)');

/**
 * Aplica un tema cambiando `data-tema` de `<html>` y pone en el botón el tema al que cambiará.
 *
 * @param {'claro'|'oscuro'} tema
 */
function aplicarTema(tema) {
  raiz.dataset.tema = tema;
  botonTema.textContent = tema === 'oscuro' ? '☀️ Claro' : '🌙 Oscuro';
}

aplicarTema(temaAplicable(leerTema(), sistemaOscuro.matches));
botonTema.addEventListener('click', () => {
  const nuevo = raiz.dataset.tema === 'oscuro' ? 'claro' : 'oscuro';
  aplicarTema(nuevo);
  guardarTema(nuevo);
});

// Consentimiento vigente (o null si no hay, está corrupto, es de otra versión o ha caducado)
function consentimientoActual() {
  const registro = leerConsentimiento();
  return consentimientoVigente(registro) ? registro : null;
}

// 10. Analítica: solo con consentimiento vigente que la acepte, y una sola vez
let analiticaActivada = false;

function activarAnaliticaSiHaySiAcepto() {
  if (consentimientoActual()?.analitica === true && !analiticaActivada) {
    analiticaActivada = true;
    console.log('📊 Analítica activada (simulada)');
  }
}

// 9. El resumen de la decisión, con textContent
function mostrarResumen() {
  textoResumenCookies.textContent = textoResumen(consentimientoActual());
}

/**
 * Se llama cuando el usuario cierra el aviso: se actualiza el resumen y, si procede, la analítica.
 * Con «Decidir más tarde» (registro `null`) no cambia nada de lo que ya hubiera guardado.
 */
function alDecidir() {
  mostrarResumen();
  activarAnaliticaSiHaySiAcepto();
}

// 8. Al cargar: si no hay consentimiento vigente y no se aplazó en esta pestaña, se muestra el aviso
mostrarResumen();
activarAnaliticaSiHaySiAcepto();
if (consentimientoActual() === null && !avisoAplazado()) {
  mostrarAviso(leerConsentimiento(), alDecidir);
}

// El enlace «Configurar cookies» lo vuelve a abrir siempre
document.querySelector('#configurar-cookies').addEventListener('click', () => {
  mostrarAviso(leerConsentimiento(), alDecidir);
});
