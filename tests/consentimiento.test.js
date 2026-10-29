import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  VERSION,
  crearConsentimiento,
  consentimientoVigente,
  leerConsentimiento,
  guardarConsentimiento,
  textoResumen,
} from '../src/consentimiento.js';
import { AlmacenFalso } from './AlmacenFalso.js';

// Fechas en hora local (sin «Z»): la caducidad se calcula en meses de calendario locales
const DECIDIDO = new Date('2025-01-15T10:00:00');
const registroDe = (fecha = DECIDIDO) => crearConsentimiento({ analitica: true }, fecha);

afterEach(() => {
  vi.useRealTimers();
});

describe('crearConsentimiento', () => {
  it('crea el registro con la versión, las opciones y la fecha en formato ISO', () => {
    const fecha = new Date('2025-01-15T10:00:00Z');
    expect(crearConsentimiento({ analitica: true, personalizacion: false }, fecha)).toEqual({
      version: VERSION,
      analitica: true,
      personalizacion: false,
      fecha: '2025-01-15T10:00:00.000Z',
    });
  });

  it('rechaza lo que no se indica', () => {
    const registro = crearConsentimiento({});
    expect(registro.analitica).toBe(false);
    expect(registro.personalizacion).toBe(false);
  });

  it.each([['true'], [1], ['si'], [{}], [undefined], [null]])(
    'rechaza el valor %j, que no es exactamente true',
    (valor) => {
      const registro = crearConsentimiento({ analitica: valor, personalizacion: valor });
      expect(registro.analitica).toBe(false);
      expect(registro.personalizacion).toBe(false);
    },
  );

  it('usa la fecha actual si no se le pasa ninguna (con el reloj fijado)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-06-01T08:30:00Z'));
    expect(crearConsentimiento({}).fecha).toBe('2030-06-01T08:30:00.000Z');
  });
});

describe('consentimientoVigente', () => {
  it('es true justo después de decidir', () => {
    expect(consentimientoVigente(registroDe(), DECIDIDO)).toBe(true);
  });

  it('es true el último instante antes de caducar (15/01/2026 a las 9:59:59.999)', () => {
    expect(consentimientoVigente(registroDe(), new Date('2026-01-15T09:59:59.999'))).toBe(true);
  });

  it('es false en el primer instante de caducidad (15/01/2026 a las 10:00)', () => {
    expect(consentimientoVigente(registroDe(), new Date('2026-01-15T10:00:00'))).toBe(false);
  });

  it('es false mucho después de la caducidad', () => {
    expect(consentimientoVigente(registroDe(), new Date('2030-01-01T00:00:00'))).toBe(false);
  });

  it('usa el reloj actual si no se le pasa la fecha (con el reloj fijado)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00'));
    expect(consentimientoVigente(registroDe())).toBe(true);
    vi.setSystemTime(new Date('2026-06-01T12:00:00'));
    expect(consentimientoVigente(registroDe())).toBe(false);
  });

  it('es false si no hay registro', () => {
    expect(consentimientoVigente(null, DECIDIDO)).toBe(false);
  });

  it('es false si el registro es de otra versión', () => {
    const registro = { ...registroDe(), version: VERSION + 1 };
    expect(consentimientoVigente(registro, DECIDIDO)).toBe(false);
  });

  it.each([['no es una fecha'], [''], [undefined], [null]])(
    'es false si la fecha no es válida (%j)',
    (fecha) => {
      expect(consentimientoVigente({ ...registroDe(), fecha }, DECIDIDO)).toBe(false);
    },
  );

  it('es false si lo guardado no es un objeto', () => {
    expect(consentimientoVigente('texto', DECIDIDO)).toBe(false);
  });
});

describe('leerConsentimiento y guardarConsentimiento', () => {
  let almacen;

  beforeEach(() => {
    almacen = new AlmacenFalso();
  });

  it('guarda y vuelve a leer el mismo registro', () => {
    const registro = registroDe();
    expect(guardarConsentimiento(registro, almacen)).toBe(true);
    expect(leerConsentimiento(almacen)).toEqual(registro);
  });

  it('guarda el registro como JSON en la clave «consentimiento»', () => {
    const registro = registroDe();
    guardarConsentimiento(registro, almacen);
    expect(JSON.parse(almacen.getItem('consentimiento'))).toEqual(registro);
  });

  it('devuelve null si no hay nada guardado', () => {
    expect(leerConsentimiento(almacen)).toBeNull();
  });

  it.each([['{no es json'], ['null'], ['[]'], ['"texto"'], ['42']])(
    'devuelve null si el valor guardado está corrupto (%s)',
    (valor) => {
      almacen.setItem('consentimiento', valor);
      expect(leerConsentimiento(almacen)).toBeNull();
    },
  );

  it('devuelve null si el almacenamiento lanza un error al leer', () => {
    const roto = {
      getItem: vi.fn(() => {
        throw new Error('bloqueado');
      }),
    };
    expect(leerConsentimiento(roto)).toBeNull();
    expect(roto.getItem).toHaveBeenCalledWith('consentimiento');
  });

  it('devuelve false si el almacenamiento está lleno', () => {
    const lleno = {
      setItem: vi.fn(() => {
        throw new DOMException('Cuota superada', 'QuotaExceededError');
      }),
    };
    expect(guardarConsentimiento(registroDe(), lleno)).toBe(false);
    expect(lleno.setItem).toHaveBeenCalledTimes(1);
  });

  it('el registro leído de un valor corrupto no se considera vigente', () => {
    almacen.setItem('consentimiento', '{roto');
    expect(consentimientoVigente(leerConsentimiento(almacen), DECIDIDO)).toBe(false);
  });
});

describe('textoResumen', () => {
  it('avisa de que aún no hay decisión', () => {
    expect(textoResumen(null)).toBe('Aún no has decidido sobre las cookies.');
  });

  it('resume técnicas y analítica con la fecha', () => {
    expect(textoResumen(registroDe())).toBe(
      'Cookies aceptadas: técnicas y analítica (15 de enero de 2025)',
    );
  });

  it('lista las tres con una coma y una «y»', () => {
    const registro = crearConsentimiento({ analitica: true, personalizacion: true }, DECIDIDO);
    expect(textoResumen(registro)).toBe(
      'Cookies aceptadas: técnicas, analítica y personalización (15 de enero de 2025)',
    );
  });

  it('resume solo la personalización con las técnicas', () => {
    const registro = crearConsentimiento({ personalizacion: true }, DECIDIDO);
    expect(textoResumen(registro)).toBe(
      'Cookies aceptadas: técnicas y personalización (15 de enero de 2025)',
    );
  });

  it('dice «solo técnicas» si se rechaza todo lo demás', () => {
    expect(textoResumen(crearConsentimiento({}, DECIDIDO))).toBe(
      'Cookies aceptadas: solo técnicas (15 de enero de 2025)',
    );
  });
});
