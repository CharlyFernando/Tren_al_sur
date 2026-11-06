import "./style.css";
import "./letter/letter.css";

import { createScene } from "./scene/createScene.js";
import { initLetter } from "./letter/letter.js";
import { createAmbientAudio } from "./audio/ambient.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let experience = null;

try {
  experience = createScene(document.querySelector("#scene"), {
    reducedMotion: reduceMotion.matches,
  });
} catch (error) {
  // The sky and the letter still work without WebGL.
  console.error("No se pudo iniciar la escena 3D:", error);
}

const audio = createAmbientAudio({
  src: `${import.meta.env.BASE_URL}audio/ambient.mp3`,
});

initLetter({
  onOpen: () => audio.play(),
});

reduceMotion.addEventListener("change", (event) => {
  experience?.setReducedMotion(event.matches);
});
