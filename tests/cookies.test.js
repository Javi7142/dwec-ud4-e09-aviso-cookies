import { describe, it, expect } from 'vitest';
import { crearCookie } from '../src/cookies.js';

describe('crearCookie', () => {
  it('crea una cookie de sesión con los valores por defecto', () => {
    expect(crearCookie('idioma', 'es')).toBe('idioma=es; path=/; SameSite=Lax');
  });

  // TODO: el resto de tests del enunciado, en este fichero y en los demás
});
