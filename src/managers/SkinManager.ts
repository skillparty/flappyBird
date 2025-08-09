import { Skin } from '../types/GameTypes';

export default class SkinManager {
  private static instance: SkinManager;
  private skins: Skin[] = [];
  private selectedSkinId: string = 'default';

  private constructor() {
    this.initializeDefaultSkins();
  }

  static getInstance(): SkinManager {
    if (!SkinManager.instance) {
      SkinManager.instance = new SkinManager();
    }
    return SkinManager.instance;
  }

  private initializeDefaultSkins() {
    this.skins = [
      { id: 'default', name: 'Classic', birdTexture: 'bird', unlocked: true },
      { id: 'blue', name: 'Blue', birdTexture: 'birdBlue', unlocked: true, pipeTint: 0x88bbff },
      { id: 'red', name: 'Red', birdTexture: 'birdRed', unlocked: false },
      { id: 'tiny', name: 'Tiny', birdTexture: 'bird', scale: 0.4, hitboxShrink: 0.2, unlocked: false },
    ];
  }

  getSkins(): Skin[] { return [...this.skins]; }

  getSelectedSkin(): Skin { return this.skins.find(s => s.id === this.selectedSkinId) || this.skins[0]; }

  selectSkin(id: string): boolean {
    const skin = this.skins.find(s => s.id === id && s.unlocked);
    if (skin) { this.selectedSkinId = id; return true; }
    return false;
  }
}
