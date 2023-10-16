console.log('ts-template')

const obj: Record<string, any> = { a: 1 }
const p = new Proxy(obj, {
  get(target: Record<string, any>, p: string) {
    return target[p]
  },
  set(target: Record<string, any>, p: string, newValue: any) {
    return (target[p] = newValue)
  }
})

const method = () => {
  p.b = 3
}

method()
