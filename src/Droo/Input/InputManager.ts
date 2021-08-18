type EventMethod<T> = (arg: T) => void;

class InputManager<T> {
  events: Record<string, EventMethod<T>[]> = {};

  addEvent = (name: string, method: EventMethod<T>) => {
    if (!this.events[name]) this.events[name] = [];
    this.events[name].push(method);
  }

  removeEvent = (name: string, method: EventMethod<T>) => {
    const methods = this.events[name];
    if (!methods) return;
    const index = methods.findIndex(x => x === method);
    if (index > -1) methods.splice(index, 1);
    if (methods.length === 0) delete this.events[name];
  }

  fireEvent = (name: string, event: T) => {
    const methods = this.events[name];
    if (!methods) return;
    methods.forEach(x => x(event));
  }
}

export default InputManager;