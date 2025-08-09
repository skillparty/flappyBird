import { DifficultySettings, PipeVariant } from '../types/GameTypes';

/**
 * DifficultyManager produce una curva de dificultad más suave al inicio:
 * - Primeros 10 puntos: cambios mínimos para permitir aprendizaje
 * - 10–25: incremento gradual acelerado
 * - 25+: estabiliza la reducción de gap y velocidad para evitar imposibilidad
 */
export default class DifficultyManager {
  static getSettings(score: number): DifficultySettings {
    // Velocidad base y límites
    const BASE_SPEED = -200;        // velocidad inicial
    const MAX_EXTRA_SPEED = -380;   // límite superior de dificultad (más negativo = más rápido)

    // Curva de velocidad (ease-out): usamos una función logística suavizada
    const t = Math.min(score / 30, 1); // normalizado 0..1 para 0-30 puntos
    // Ease-out cubic
    const easeOut = 1 - Math.pow(1 - t, 3);
    const speed = BASE_SPEED + (MAX_EXTRA_SPEED - BASE_SPEED) * easeOut; // Interpolación

    // Curva de gap: amplio al inicio, reducción suave luego se aplana
    const BASE_GAP = 210;
    const MIN_GAP = 120;
    const gapReduction = (BASE_GAP - MIN_GAP) * easeOut * 0.9; // No llega al mínimo demasiado pronto
    const gap = Math.round(BASE_GAP - gapReduction);

    // Variantes desbloqueadas de forma más gradual
    const allowedVariants: PipeVariant[] = [PipeVariant.STATIC];
    if (score >= 8) allowedVariants.push(PipeVariant.OSCILLATING);
    if (score >= 14) allowedVariants.push(PipeVariant.NARROW);
    if (score >= 20) allowedVariants.push(PipeVariant.DECORATED);
    if (score >= 32) allowedVariants.push(PipeVariant.DOUBLE);

    return { speed, gap, allowedVariants };
  }
}
