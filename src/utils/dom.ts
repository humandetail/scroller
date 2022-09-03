export const createElement = (name: keyof HTMLElementTagNameMap, props?: Record<string, any> | null, styles?: Record<string, any> | string) => {
  const oElement = document.createElement(name) as HTMLElement

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      oElement.setAttribute(key, value)
    })
  }

  if (styles) {
    setStyles(oElement, styles)
  }

  return oElement
}

export const setStyles = (el: HTMLElement, styles: Record<string, any> | string) => {
  if (typeof styles === 'string') {
    el.style.cssText += styles
  } else {
    Object.entries(styles).forEach(([key, value]) => {
      el.style[key as any] = value
    })
  }
}

export const getScrollOffset = () => {
  if (window.pageXOffset) {
    return {
      left: window.pageXOffset,
      top: window.pageYOffset
    };
  } else {
    return {
      left: document.documentElement.scrollLeft + document.body.scrollLeft,
      top: document.documentElement.scrollTop + document.body.scrollTop
    }
  }
}

export const getPagePos = (e: MouseEvent): {x: number; y: number;} & Record<string, any> => {
  e = e || window.event
  const {
    clientX,
    clientY
  } = e
  const {
    left: scrollLeft,
    top: scrollTop
  } = getScrollOffset()
  const offsetX = document.documentElement.offsetLeft || 0,
    offsetY = document.documentElement.offsetTop || 0

  return {
    x: clientX + scrollLeft - offsetX,
    y: clientY + scrollTop - offsetY
  }
}

export const getOverflow = (el: HTMLElement) => {
  let overflow = el.style.overflow
  if (!overflow || overflow === 'visible') {
    el.style.overflow = 'hidden'
  }
  return [
    el.clientWidth < el.scrollWidth,
    el.clientHeight < el.scrollHeight
  ]
}

export function wrapContent (wrapper: HTMLElement, content: HTMLElement) {
  if (content === document.body) {
    throw new Error(`Cannot use body as el.`)
  }
  if (!content.parentNode) {
    throw new Error(`el.parentNode is not a HTMLElement`)
  }
  content.parentNode.insertBefore(wrapper, content)

  wrapper.appendChild(content)
}

export function wrapBar (wrapper: HTMLElement, bar: HTMLElement) {
  wrapper.appendChild(bar)
}

export function addEvent (target: Window | Document | Element, type: string, fn: (this: Document, ev: any) => any) {
  if (target.addEventListener) {
    target.addEventListener(type, fn, false)
    return () => {
      target.removeEventListener(type, fn, false)
    }
  }
  if ((target as any).attachEvent) {
    const callback = function () {
      fn.call((target as any), null)
    }
    ;(target as any).attachEvent('on' + type, callback);

    return () => {
      (target as any).detachEvent('on' + type, callback)
    }
  }

  (target as any)['on' + type] = fn
  return () => {
    (target as any)['on' + type] = null
  }
}
