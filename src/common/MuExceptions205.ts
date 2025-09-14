export class MuExceptions205 extends Error {
  constructor(message: string) {
    super(message)
    // Ensure the name of this error is the same as the class
    this.name = this.constructor.name
  }
}


export class MuExceptions205NoEncrypted extends Error {
  constructor(message: string) {
    super(message)
    // Ensure the name of this error is the same as the class
    this.name = this.constructor.name
  }
}
