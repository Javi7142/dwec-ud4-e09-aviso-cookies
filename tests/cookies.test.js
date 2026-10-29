import { describe, it, expect } from 'vitest';
import { crearCookie, leerCookie } from '../src/cookies.js';

describe('crearCookie', () => {
  it('crea una cookie de sesión con los valores por defecto', () => {
    expect(crearCookie('idioma', 'es')).toBe('idioma=es; path=/; SameSite=Strict');
  });

  it('añade max-age, SameSite y Secure cuando se piden', () => {
    expect(crearCookie('idioma', 'es', { maxAge: 60, sameSite: 'Strict', secure: true })).toBe(
      'idioma=es; max-age=60; path=/; SameSite=Strict; Secure',
    );
  });

  it('codifica el valor para que no rompa la cookie', () => {
    expect(crearCookie('nombre', 'Ana García; admin=true')).toBe(
      'nombre=Ana%20Garc%C3%ADa%3B%20admin%3Dtrue; path=/; SameSite=Lax',
    );
  });

  it('usa el path indicado', () => {
    expect(crearCookie('a', 'b', { path: '/tienda' })).toBe('a=b; path=/tienda; SameSite=Lax');
  });

  it('con maxAge 0 pone max-age=0 (la cookie caduca ya)', () => {
    expect(crearCookie('a', 'b', { maxAge: 0 })).toContain('max-age=0');
  });

  it('no pone Secure si secure es false', () => {
    expect(crearCookie('a', 'b', { secure: false })).not.toContain('Secure');
  });

  it('acepta un valor vacío', () => {
    expect(crearCookie('a', '')).toBe('a=; path=/; SameSite=Lax');
  });
});

describe('leerCookie', () => {
  const texto = 'idioma=es; nombre=Ana%20Garc%C3%ADa';

  it('lee una cookie por su nombre y decodifica el valor', () => {
    expect(leerCookie('nombre', texto)).toBe('Ana García');
    expect(leerCookie('idioma', texto)).toBe('es');
  });

  it('busca el nombre exacto: «idi» no encuentra «idioma»', () => {
    expect(leerCookie('idi', texto)).toBeNull();
    expect(leerCookie('ioma', texto)).toBeNull();
  });

  it('devuelve null si la cookie no existe', () => {
    expect(leerCookie('otra', texto)).toBeNull();
  });

  it('devuelve null con un texto vacío', () => {
    expect(leerCookie('idioma', '')).toBeNull();
  });

  it('no confunde el valor de una cookie con el nombre de otra', () => {
    expect(leerCookie('es', 'idioma=es')).toBeNull();
  });

  it('lee un valor vacío como cadena vacía', () => {
    expect(leerCookie('a', 'a=; b=1')).toBe('');
  });

  it('conserva los signos «=» del valor', () => {
    expect(leerCookie('a', 'a=x=y')).toBe('x=y');
  });

  it('devuelve el valor tal cual si está mal codificado, sin lanzar un error', () => {
    expect(leerCookie('a', 'a=100%')).toBe('100%');
  });

  it('lee la cookie aunque no haya espacio después del punto y coma', () => {
    expect(leerCookie('b', 'a=1;b=2')).toBe('2');
  });

  it('es la inversa de crearCookie para el valor', () => {
    const cookie = crearCookie('x', 'ñandú & café; =');
    expect(leerCookie('x', cookie.split('; ')[0])).toBe('ñandú & café; =');
  });
});
