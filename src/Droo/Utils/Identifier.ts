class Identifier {
  count: number;

  constructor() {
    this.count = -1;
  }

  getNextID() {
    this.count++;
    return this.count
  }
}

export default new Identifier();