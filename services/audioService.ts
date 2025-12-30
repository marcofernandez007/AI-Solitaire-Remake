
import { Howl } from 'howler';

const sounds = {
  flip: new Howl({
    src: ['https://www.soundjay.com/misc/sounds/page-flip-01a.mp3'],
    volume: 0.4
  }),
  move: new Howl({
    src: ['https://www.soundjay.com/buttons/sounds/button-20.mp3'],
    volume: 0.2
  }),
  win: new Howl({
    src: ['https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'],
    volume: 0.6
  }),
  oracle: new Howl({
    src: ['https://www.soundjay.com/misc/sounds/magic-chime-01.mp3'],
    volume: 0.3
  }),
  shuffle: new Howl({
    src: ['https://www.soundjay.com/misc/sounds/deck-of-cards-01.mp3'],
    volume: 0.5
  })
};

let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const playSound = (soundName: keyof typeof sounds) => {
  if (soundEnabled) {
    sounds[soundName].play();
  }
};
