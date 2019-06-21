class Maybe {
  constructor(val = null) {
    this.val = val
  }

  static some(value) {
    return new Maybe(value)
  }
  static none() {
    return new Maybe()
  }

  get hasValue() {
    return !!this.val
  }
  get value() {
    if (!this.hasValue) {
      throw new Error('Maybe does not have a value')
    }

    return this.val
  }

  valueOrDefault(defaultValue) {
    return this.case(val => val, () => defaultValue)
  }

  case(some, none) {
    return this.hasValue ? some(this.val) : none()
  }
}

module.exports = {
  Maybe
}
