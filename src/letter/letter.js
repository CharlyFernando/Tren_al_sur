export function initLetter({ root, onOpen, onClose } = {}) {
  const letter = root ?? document.querySelector(".letter");
  if (!letter) return null;

  const trigger = letter.querySelector(".letter-trigger");
  const sheet = letter.querySelector(".letter-sheet");
  const closeButton = letter.querySelector(".letter-sheet__close");
  const overlay = letter.querySelector(".letter__overlay");

  let isOpen = false;
  let focusTimer = 0;

  function setOpen(next) {
    if (!trigger || next === isOpen) return;

    isOpen = next;
    letter.dataset.state = next ? "open" : "closed";
    trigger.setAttribute("aria-expanded", String(next));
    sheet?.setAttribute("aria-hidden", String(!next));

    window.clearTimeout(focusTimer);

    if (next) {
      onOpen?.();
      focusTimer = window.setTimeout(
        () => sheet?.focus({ preventScroll: true }),
        320
      );
    } else {
      onClose?.();
      focusTimer = window.setTimeout(
        () => trigger.focus({ preventScroll: true }),
        420
      );
    }
  }

  trigger?.addEventListener("click", () => setOpen(true));
  closeButton?.addEventListener("click", () => setOpen(false));
  overlay?.addEventListener("click", () => setOpen(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setOpen(false);
    }
  });

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!isOpen),
    get isOpen() {
      return isOpen;
    },
  };
}
