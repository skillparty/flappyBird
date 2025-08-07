# Audio Assets

This directory contains audio files for the Flappy Bird game.

## Required Audio Files

- `jump.wav` - Sound effect for bird jumping
- `score.wav` - Sound effect for scoring points
- `hit.wav` - Sound effect for collisions
- `background.mp3` - Background music (optional)

## Audio Format Requirements

- **Sound Effects**: WAV format, 16-bit, 44.1kHz
- **Background Music**: MP3 format, stereo, 128kbps or higher
- **Duration**: Sound effects should be short (< 1 second), background music can be longer

## Fallback Behavior

If audio files are not available, the game will:
1. Continue to function normally without sound
2. Log warnings about missing audio files
3. Use silent fallbacks for all audio calls

## Creating Audio Files

You can create simple audio files using:
- **Audacity** (free, cross-platform)
- **GarageBand** (macOS)
- **Online generators** for simple beep sounds

### Simple Sound Effects

For testing purposes, you can create simple beep sounds:
- Jump: 440Hz tone, 0.1 seconds
- Score: 660Hz tone, 0.2 seconds  
- Hit: 220Hz tone, 0.3 seconds