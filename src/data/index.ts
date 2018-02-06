let isSupportProxy = true

try {
  const proxy = new Proxy({}, {
    set () {
      return true
    }
  })
} catch (error) {
  isSupportProxy = false
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Warn] Your browser doesn\'t support Proxy.')
  }
}

class Data {
  static createTypeSafetyInstance <T> (Constructor: new (...args) => any, ...args): T {
    const obj = new Constructor(...args)

    if (!isSupportProxy) {
      return obj
    }

    return new Proxy(obj, {
      set (target, keyName, value, proxy) {
        const newType = getType(value)
        const correctType = getType(target[keyName])
        if (newType === correctType) {
          Reflect.set(target, keyName, value)
        } else {
          console.warn(
            `[Warn] Incorrect data type was given to property "${keyName}" on "${Constructor.name}":\n` +
            `       "${value}" (${getTypeText(newType)}) was given, but should be a ${getTypeText(correctType)}.`
          )
        }
        // Always return true to avoid error throwing.
        return true
      }
    })
  }
}

function getType (target: any) {
  return Object.prototype.toString.call(target)
}

function getTypeText (fullTypeString: string) {
  return fullTypeString.replace(/\[object |\]/g, '')
}

export {
  Data
}
