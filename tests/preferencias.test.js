import { describe, it, expect, beforeEach, vi } from 'vitest';
import { leerTema, guardarTema, temaAplicable } from '../src/preferencias.js';
import { AlmacenFalso } from './AlmacenFalso.js';

describe('leerTema y guardarTema', () => {
  let almacen;

  beforeEach(() => {
    almacen = new AlmacenFalso();
  });

  it('devuelve null si no hay tema guardado', () => {
    expect(leerTema(almacen)).toBeNull();
  });

  it.each(['claro', 'oscuro'])('guarda y lee el tema «%s»', (tema) => {
    guardarTema(tema, almacen);
    expect(leerTema(almacen)).toBe(tema);
  });

  it('guarda el tema como JSON { tema } en la clave «preferencias»', () => {
    guardarTema('oscuro', almacen);
    expect(JSON.parse(almacen.getItem('preferencias'))).toEqual({ tema: 'oscuro' });
  });

  it('el último tema guardado sustituye al anterior', () => {
    guardarTema('claro', almacen);
    guardarTema('oscuro', almacen);
    expect(leerTema(almacen)).toBe('oscuro');
  });

  it.each([['{no es json'], ['null'], ['{}'], ['{"tema":"azul"}'], ['{"tema":3}'], ['"oscuro"']])(
    'devuelve null si el valor guardado no es un tema válido (%s)',
    (valor) => {
      almacen.setItem('preferencias', valor);
      expect(leerTema(almacen)).toBeNull();
    },
  );

  it('devuelve null si el almacenamiento lanza un error al leer', () => {
    const roto = {
      getItem: vi.fn(() => {
        throw new Error('bloqueado');
      }),
    };
    expect(leerTema(roto)).toBeNull();
  });

  it('no lanza ningún error si el almacenamiento está lleno al guardar', () => {
    const lleno = {
      setItem: vi.fn(() => {
        throw new DOMException('Cuota superada', 'QuotaExceededError');
      }),
    };
    expect(() => guardarTema('oscuro', lleno)).not.toThrow();
    expect(lleno.setItem).toHaveBeenCalledWith('preferencias', '{"tema":"oscuro"}');
  });
});

describe('temaAplicable', () => {
  it.each([
    ['claro', true, 'claro'],
    ['claro', false, 'claro'],
    ['oscuro', true, 'oscuro'],
    ['oscuro', false, 'oscuro'],
    [null, true, 'oscuro'],
    [null, false, 'claro'],
    [undefined, true, 'oscuro'],
    ['azul', false, 'claro'],
  ])('con tema elegido %j y sistema oscuro %j aplica «%s»', (elegido, sistemaOscuro, esperado) => {
    expect(temaAplicable(elegido, sistemaOscuro)).toBe(esperado);
  });
});
