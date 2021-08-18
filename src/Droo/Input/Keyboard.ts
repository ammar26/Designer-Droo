import InputManager from "./InputManager";

class Keyboard extends InputManager<KeyboardEvent> {
  ctrlHold : boolean;
  altHold : boolean;
  shiftHold : boolean;

  constructor() {
    super();
    this.ctrlHold = false;
    this.altHold = false;
    this.shiftHold = false;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  onKeyDown = (ev: KeyboardEvent) => {
    if(ev.keyCode === 17) this.ctrlHold = true;
    else if(ev.keyCode === 18) this.altHold = true;
    else if(ev.keyCode === 16) this.shiftHold = true;
    this.fireEvent("KeyDown", ev);
  };

  onKeyUp = (ev: KeyboardEvent) => {
    if(ev.keyCode === 17) this.ctrlHold = false;
    else if(ev.keyCode === 18) this.altHold = false;
    else if(ev.keyCode === 16) this.shiftHold = false;
    this.fireEvent("KeyUp", ev);
  };
}

export default Keyboard;