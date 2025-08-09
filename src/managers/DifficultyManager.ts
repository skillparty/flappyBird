import { DifficultySettings, PipeVariant } from '../types/GameTypes';

export default class DifficultyManager {
  static getSettings(score: number): DifficultySettings {
    // Progressive difficulty curve
    const baseSpeed = -200;
    const speed = baseSpeed - Math.min(150, Math.floor(score / 10) * 10); // up to -350
    const baseGap = 200;
    const gap = Math.max(120, baseGap - Math.log2(1 + score) * 15);

    const allowedVariants: PipeVariant[] = [PipeVariant.STATIC];
    if (score > 5) allowedVariants.push(PipeVariant.OSCILLATING);
    if (score > 10) allowedVariants.push(PipeVariant.NARROW);
    if (score > 15) allowedVariants.push(PipeVariant.DECORATED);
    if (score > 25) allowedVariants.push(PipeVariant.DOUBLE);

    return { speed, gap, allowedVariants };
  }
}
