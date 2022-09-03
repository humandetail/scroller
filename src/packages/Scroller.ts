import isMobile from 'ismobilejs'

import { EventType, ScrollerOptions } from '../types'
import {
  createElement,
  setStyles,
  wrapContent,
  getOverflow
} from '../utils/dom'
import Scrollbar from './ScrollBar'

export default class Scroller {
  options: ScrollerOptions
  #scrollbar: {
    x: Scrollbar | null,
    y: Scrollbar | null
  } = { x: null, y: null }
  #oWrapper: HTMLElement
  #oContent: HTMLElement
  #observer: MutationObserver

  #refresh: () => any = () => {}

  #fns = new Map<EventType, Array<() => any>>()

  constructor (el: string | HTMLElement, options: Partial<ScrollerOptions> = {}) {
    this.options = {
      width: 'auto',
      height: '100vh',
      wheelStep: 20,
  
      scrollbarWidth: 10,
      buttonSize: 10,
      trackWidth: 10,
      thumbWidth: 10,
      button: true,
  
      resize: true,
      observe: true,
      styles: {},
  
      ...options,

      reachOffset: Object.assign({
        top: 0,
        right: 0,
        left: 0,
        bottom: 0
      }, options.reachOffset),
    }
  
    const oContent = typeof el === 'string'
      ? document.querySelector(el) as HTMLElement
      : el
      
    if (!oContent || !('innerHTML' in oContent)) {
      throw new TypeError(`${el} is not a HTMLElement or a selector.`)
    }
  
    this.#oWrapper = createElement('div', {
        class: 'scroller__wrapper'
      }, {
        position: 'relative',
        width: this.options.width,
        height: this.options.height,
        overflow: 'hidden'
      })
    
    wrapContent(this.#oWrapper, oContent)
    setStyles(oContent, {
      transform: 'translate3d(0, 0, 0)'
    })

    this.#oContent = oContent
  
    this.refresh()
  
    if (this.options.resize) {
      this.#refresh = this.refresh.bind(this)
      window.addEventListener('resize', this.#refresh, false)
    } 
    this.#observer = new MutationObserver((mutationList, observer) => {
      this.refresh()
    })
  
    if (this.options.observe) {
      this.#observer.observe(oContent, {
        attributes: false,
        childList: true,
        subtree: true
      })
    }
  }

  get scrollLeft () {
    return this.#scrollbar.x?.distance || 0
  }

  get scrollTop () {
    return this.#scrollbar.y?.distance || 0
  }
  
  // 重新计算尺寸、位置
  refresh () {
    if (isMobile(window.navigator).any) {
      this.destroy()
      return
    }

    const oWrapper = this.#oWrapper
    const oContent = this.#oContent
    const scrollbar = this.#scrollbar
    const { options } = this
    const [isXOverflow, isYOverflow] = getOverflow(oWrapper)
    
    let cssText = ''

    if (scrollbar.x) {
      scrollbar.x.refresh()
    } else {
      if (isXOverflow) {
        cssText += `padding-bottom: ${options.scrollbarWidth}px;`

        scrollbar.x = new Scrollbar(oWrapper, oContent, 'X', options, isYOverflow, this.#fns)
      }
    }

    if (scrollbar.y) {
      scrollbar.y.refresh()
    } else {
      if (isYOverflow) {
        cssText += `padding-right: ${options.scrollbarWidth}px;`

        scrollbar.y = new Scrollbar(oWrapper, oContent, 'Y', options, isXOverflow, this.#fns)
      }
    }

    if (cssText) {
      setStyles(oWrapper, cssText)
    }

    // 触发 refresh
    if (this.#fns.has('refresh')) {
      this.#fns.get('refresh')!.forEach(cb => cb())
    }
  }

  on (type: EventType, callback: () => any) {
    if (!this.#fns.has(type)) {
      this.#fns.set(type, [])
    }

    this.#fns.get(type)!.push(callback)
  }
  
  scroll (x?: number, y?: number) {
    const scrollbar = this.#scrollbar
    if (typeof x === 'number' && scrollbar.x) {
      scrollbar.x.scroll(x)
    }
    
    if (typeof y === 'number' && scrollbar.y) {
      scrollbar.y.scroll(y)
    }
  }
    
  scrollBy (x?: number, y?: number) {
    const scrollbar = this.#scrollbar
    if (typeof x === 'number' && scrollbar.x) {
      scrollbar.x.scrollBy(x)
    }
    
    if (typeof y === 'number' && scrollbar.y) {
      scrollbar.y.scrollBy(y)
    }
  }
  
  getScroll (type: 'left' | 'top') {
    const scrollbar = this.#scrollbar
    switch (type) {
      case 'left':
        return -(scrollbar.x?.distance || 0)
      case 'top':
        return -(scrollbar.y?.distance || 0)
      default:
        return 0
    }
  }
  
  destroy () {
    const { options } = this
    const oWrapper = this.#oWrapper
    const oContent = this.#oContent
    const scrollbar = this.#scrollbar
    if (options.resize) {
      window.removeEventListener('resize', this.#refresh, false)
    }
    if (options.observe) {
      this.#observer?.disconnect()
    }

    scrollbar.x?.destroy()
    scrollbar.y?.destroy()

    oWrapper.parentNode?.appendChild(oContent)
    oWrapper.parentNode?.removeChild(oWrapper)
  }
}
