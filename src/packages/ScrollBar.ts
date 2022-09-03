import { EventType, Position, ScrollbarType, ScrollerOptions } from '../types'
import { addEvent, createElement, getPagePos, setStyles } from '../utils/dom'

export default class Scrollbar {
  oWrapper: HTMLElement
  oContent: HTMLElement
  type: ScrollbarType
  options: ScrollerOptions
  isCross: boolean = false

  oBar: HTMLElement
  oPrevButton: HTMLElement | null = null
  oNextButton: HTMLElement | null = null
  oTrack: HTMLElement
  oThumb: HTMLElement

  requestId: number = 0

  #innerListeners: Array<{
    target: Window | Document | Element;
    type: string;
    remove: () => void
  }> = []

  #fns = new Map<EventType, Array<(position?: Position) => any>>()

  distance = {
    contentDistance: 0,
    thumbDistance: 0
  }

  /** 容器的宽度 / 高度 */
  wrapperWidth = 0
  /** 内容区宽度 / 高度 */
  contentWidth = 0
  /** 轨道的宽度 / 高度 */
  trackWidth = 0
  /** 轨道距离浏览器左上角的水平距离 / 垂直距离 */
  trackPosLeft = 0
  /** 滚动条滑块的宽度 / 高度 */
  thumbWidth = 0
  /** 最大 X 轴 / Y 轴滚动距离 */
  maxScrollLeft = 0
  /** X 轴 / Y轴滑块最大滚动距离  */
  thumbmaxScrollLeft = 0
  /** 鼠标点击时的坐标 x / y */
  pagePos = 0
  /** 手势触摸初始的 x / y */
  touchPos = {
    pageX: 0,
    pageY: 0
  }

  reachTop = false
  reachBottom = false

  isTop = true
  isBottom = false

  constructor (
    oWrapper: HTMLElement,
    oContent: HTMLElement,
    type: ScrollbarType,
    options: ScrollerOptions,
    isCross = false,
    fns: Map<EventType, Array<() => any>>
  ) {
    this.oWrapper = oWrapper
    this.oContent = oContent
    this.type = type
    this.options = options
    this.isCross = isCross
    this.#fns = fns

    const {
      oBar,
      oPrevButton,
      oNextButton,
      oTrack,
      oThumb
    } = createBar(type, options, isCross)

    this.oBar = oBar
    this.oPrevButton = oPrevButton
    this.oNextButton = oNextButton
    this.oTrack = oTrack
    this.oThumb = oThumb
  
    oWrapper.appendChild(oBar)
    this.refresh()
    this.initEvent()
  }

  /** 内容区滚动距离 */
  get contentDistance () {
    return this.distance.contentDistance
  }

  set contentDistance (val) {
    this.distance.contentDistance = val
    this.#setTransform(this.oContent, val)
  }

  /** 滑块的滚动距离 */
  get thumbDistance () {
    return this.distance.thumbDistance
  }

  set thumbDistance (val) {
    this.distance.thumbDistance = val
    this.#setTransform(this.oThumb, val)
  }

  setInnerListeners (target: Window | Document | Element, type: string, fn: (this: Document, ev: any) => any) {
    this.#innerListeners.push({
      target,
      type,
      remove: addEvent(target, type, fn)
    })
  }

  refresh () {
    const {
      oWrapper,
      oContent,
      oTrack,
      oThumb,
      type
    } = this
    const {
      left: trackLeft,
      top: trackTop,
      width: trackWidth,
      height: trackHeight
    } = oTrack.getBoundingClientRect()

    const { width: wrapperWidth, height: wrapperHeight } = oWrapper.getBoundingClientRect()

    if (type === 'X') {
      if (this.thumbDistance > 0) {
        this.thumbDistance = this.thumbDistance * wrapperWidth / this.wrapperWidth
      }

      const contentWidth = oContent.scrollWidth

      this.maxScrollLeft = contentWidth - wrapperWidth
      this.thumbWidth = trackWidth * (wrapperWidth / contentWidth)
      this.thumbmaxScrollLeft = trackWidth - this.thumbWidth
      this.trackPosLeft = trackLeft
      this.wrapperWidth = wrapperWidth
      this.contentWidth = contentWidth
    
      setStyles(oThumb, {
        width: this.thumbWidth + 'px'
      })
    } else {
      if (this.thumbDistance > 0) {
        this.thumbDistance = this.thumbDistance * wrapperHeight / this.wrapperWidth
      }

      const { height: contentHeight } = oContent.getBoundingClientRect()
      this.maxScrollLeft = contentHeight - wrapperHeight
      this.thumbWidth = trackHeight * (wrapperHeight / contentHeight)
      this.thumbmaxScrollLeft = trackHeight - this.thumbWidth
      this.trackPosLeft = trackTop
      this.wrapperWidth = wrapperHeight
      this.contentWidth = contentHeight
    
      setStyles(oThumb, {
        height: this.thumbWidth + 'px'
      })
    }
  }

  initEvent () {
    const {
      oWrapper,
      oPrevButton,
      oNextButton,
      oTrack,
      oThumb
    } = this
    this.setInnerListeners(oWrapper, 'mouseenter', this.handleMouseEnter.bind(this))
    this.setInnerListeners(oWrapper, 'mouseleave', this.handleMouseLeave.bind(this))

    this.setInnerListeners(oWrapper, 'DOMMouseScroll', this.handleWheel.bind(this))
    this.setInnerListeners(oWrapper, 'mousewheel', this.handleWheel.bind(this))

    if (oPrevButton) {
      this.setInnerListeners(oPrevButton, 'mousedown', this.handlMouseDown.bind(this))
    }
    if (oNextButton) {
      this.setInnerListeners(oNextButton, 'mousedown', this.handlMouseDown.bind(this))
    }
    this.setInnerListeners(oTrack, 'mousedown', this.handlMouseDown.bind(this))
    this.setInnerListeners(oThumb, 'mousedown', this.handlMouseDown.bind(this))
  }

  handleMouseEnter () {
    setStyles(this.oBar, {
      opacity: 1
    })
  }

  handleMouseLeave () {
    setStyles(this.oBar, {
      opacity: 0
    })
  }

  handleWheel (e: WheelEvent) {
    if (this.type === 'X') {
      return
    }

    e.preventDefault()

    let delta = 0
    if (e.deltaY) {
      delta = e.deltaY > 0 ? 1 : -1
    }
    if (e.detail) {
      delta = e.detail > 0 ? 1 : 1
    }

    this.scrollContent(delta, true);
  }

  handlMouseDown (e: MouseEvent) {
    e.preventDefault()
    const { target } = e
    if (!target) {
      return
    }

    const {
      oPrevButton,
      oNextButton,
      oTrack,
      oThumb
    } = this

    switch (target) {
      case oPrevButton:
        this.run(-1, true)
        this.setInnerListeners(document, 'mouseup', this.handleMouseUp.bind(this))
        break
      case oNextButton:
        this.run(1, true)
        this.setInnerListeners(document, 'mouseup', this.handleMouseUp.bind(this))
        break
      case oTrack:
        const pos = getPagePos(e)[this.type.toLowerCase()]
        const {
          thumbDistance,
          trackPosLeft,
          thumbWidth
        } = this
        if (pos < thumbDistance + trackPosLeft) {
          this.run(-1, true, (currentDistance: number) => pos >= trackPosLeft + currentDistance)
        } else if (pos >= thumbDistance + trackPosLeft + thumbWidth) {
          this.run(1, true, (currentDistance: number) => pos <= trackPosLeft + currentDistance + thumbWidth)
        }
        this.setInnerListeners(document, 'mouseup', this.handleMouseUp.bind(this))
        break
      case oThumb:
        this.pagePos = getPagePos(e)[this.type.toLowerCase()]
        this.setInnerListeners(document, 'mousemove', this.handleMouseMove.bind(this))
        this.setInnerListeners(document, 'mouseup', this.handleMouseUp.bind(this))
        break
      default:
        break
    }
  }

  handleMouseMove (e: MouseEvent) {
    e.preventDefault()

    const {
      type,
      pagePos,
      thumbmaxScrollLeft,
      maxScrollLeft
    } = this

    const newPagepos = getPagePos(e)[type.toLowerCase()]

    let thumbDistance = this.thumbDistance + newPagepos - pagePos
    thumbDistance = Math.min(Math.max(thumbDistance, 0), thumbmaxScrollLeft);

    this.thumbDistance = thumbDistance

    let contentDistance = -1 * maxScrollLeft * (thumbDistance / thumbmaxScrollLeft)
    contentDistance = Math.max(-1 * maxScrollLeft, Math.min(0, contentDistance))

    this.contentDistance = contentDistance

    this.pagePos = newPagepos
  }

  handleMouseUp (e: MouseEvent) {
    e.preventDefault()
    cancelAnimationFrame(this.requestId)
    this.#innerListeners.forEach(item => {
      if (
        item.target === document &&
        (item.type === 'mousemove' || item.type === 'mouseup')
      ) {
        item.remove()
      }
    })
    this.#innerListeners = this.#innerListeners.filter(item => {
      return !(
        item.target === document &&
        (item.type === 'mousemove' || item.type === 'mouseup')
      )
    })
  }

  run (y: number, isWheel: boolean, isStop?: (currentDistance: number) => boolean) {
    if (typeof isStop === 'function') {
      if (isStop(this.thumbDistance)) {
        cancelAnimationFrame(this.requestId)
        return
      }
    }

    this.requestId = requestAnimationFrame(() => this.run(y, isWheel, isStop))

    this.scrollContent(y, isWheel)
  }

  scrollContent (y: number, isWheel: boolean = false) {
    const {
      options: {
        wheelStep
      },
      maxScrollLeft,
      thumbmaxScrollLeft,
    } = this

    const contentDistance = Math.max(-1 * maxScrollLeft, Math.min(0, this.contentDistance += -1 * wheelStep * y))

    if (isWheel) {
      const thumbDistance = Math.min(Math.max(-1 * thumbmaxScrollLeft * contentDistance / maxScrollLeft, 0), thumbmaxScrollLeft)
      this.thumbDistance = thumbDistance
    }

    this.contentDistance = contentDistance
  }

  #setTransform (target: HTMLElement, val: number) {
    if (
      (target === this.oContent && Math.abs(val) >= this.maxScrollLeft && this.isBottom) ||
      (target === this.oThumb && Math.abs(val) >= this.thumbmaxScrollLeft && this.isBottom)
    ) {
      return
    }
    
    if (
      (target === this.oContent && Math.abs(val) <= 0 && this.isTop) ||
      (target === this.oThumb && Math.abs(val) <= 0 && this.isTop)
    ) {
      return
    }
    if (target === this.oContent) {
      this.isBottom =  Math.abs(val) >= this.maxScrollLeft
      this.isTop = Math.abs(val) <= 0
    }

    const { transform } = target.style
    const { type } = this
    setStyles(target, {
      transform: transform.includes(`translate3d`)
        ? transform.replace(
          /translate3d\((.+?)px, (.+?)px, (.+?)px\)/,
          ($, $1, $2, $3) => `translate3d(${type === 'X' ? val : $1}px, ${type === 'Y' ? val : $2}px, ${$3}px)`
        )
        : (transform + `translate3d(${type === 'X' ? val : 0}px, ${type === 'Y' ? val : 0}px, 0px)`)
    })

    if (target === this.oContent) {
      const { type, options: { reachOffset } } = this

      switch (type) {
        case 'X':
          if (Math.abs(val) + reachOffset.right >= this.maxScrollLeft) {
            if (!this.reachBottom) {
              this.reachBottom = true
              this.trigger('reachright')
            }
          } else {
            this.reachBottom = false
          }

          if (Math.abs(val) <= reachOffset.left) {
            if (!this.reachTop) {
              this.reachTop = true
              this.trigger('reachleft')
            }
          } else {
            this.reachTop = false
          }
          break
        case 'Y':
          if (Math.abs(val) + reachOffset.bottom >= this.maxScrollLeft) {
            if (!this.reachBottom) {
              this.reachBottom = true
              this.trigger('reachbottom')
            }
          } else {
            this.reachBottom = false
          }

          if (Math.abs(val) <= reachOffset.top) {
            if (!this.reachTop) {
              this.reachTop = true
              this.trigger('reachtop')
            }
          } else {
            this.reachTop = false
          }
          break
        default:
          break
      }
    }
  }

  scroll (x: number) {
    setStyles(this.oContent, {
      transition: 'transform .3s linear'
    })
    this.contentDistance = Math.max(-1 * this.maxScrollLeft, Math.min(0, -x))

    setTimeout(() => {
      setStyles(this.oContent, {
        transition: ''
      })
    }, 300)
    
    const thumbDistance = Math.min(Math.max(-1 * this.thumbmaxScrollLeft * this.contentDistance / this.maxScrollLeft, 0), this.thumbmaxScrollLeft)

    setStyles(this.oThumb, {
      transition: 'transform .5s linear'
    })

    this.thumbDistance = thumbDistance

    setTimeout(() => {
      setStyles(this.oThumb, {
        transition: ''
      })
    }, 300)
  }

  scrollBy (x: number) {
    this.scroll(this.contentDistance + x)
  }

  trigger (type: Exclude<EventType, 'refresh'>) {
    if (this.#fns.has(type)) {
      this.#fns.get(type)!.forEach(cb => cb())
    }
  }

  destroy () {
    this.#innerListeners.forEach(({ remove }) => remove())
    this.oContent.setAttribute('style', '')
  }
}

function createBar (type: ScrollbarType, options: ScrollerOptions, isCross = false) {
  // 滚动条
  const oBar = createElement(
    'div',
    { class: `scroller__scrollbar scroller__scrollbar-${type.toLowerCase()}` },
    Object.assign({
      display: 'flex',
      flexDirection: type === 'Y' ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'absolute',
      [type === 'Y' ? 'right' : 'left']: 0,
      [type === 'Y' ? 'top' : 'bottom']: 0,
      zIndex: 2147483647,
      [type === 'Y' ? 'width' : 'height']: `${options.scrollbarWidth}px`,
      [type === 'Y' ? 'height' : 'width']: isCross ? `calc(100% - ${options.scrollbarWidth}px)` : '100%',
      borderRadius: `${options.scrollbarWidth}px`,
      backgroundColor: '#f1f1f1',
      opacity: 0,
      transition: 'opacity .3s linear'
    }, options.styles.bar || {})
  )

  // 轨道
  const oTrack = createElement(
    'div',
    { class: `scroller__scrollbar-track scroller__scrollbar-track-${type.toLowerCase()}` },
    Object.assign({
      [`${type === 'Y' ? 'width' : 'height'}`]: options.trackWidth + 'px',
      flex: 1,
      borderRadius: '50%',
      transition: 'width,height .3s linear'
    }, options.styles.track || {})
  )

  // 滑块
  const oThumb = createElement(
    'div',
    { class: `scroller__scrollbar-thumb scroller__scrollbar-thumb-${type.toLowerCase()}` },
    Object.assign({
      width: options.thumbWidth + 'px',
      height: options.thumbWidth + 'px',
      borderRadius: options.thumbWidth + 'px',
      backgroundColor: '#e1e1e1',
      transition: 'width,height .3s linear'
    }, options.styles.thumb || {})
  )

  let oPrevButton: HTMLElement | null = null
  let oNextButton: HTMLElement | null = null

  if (options.button) {
    // 上下箭头
    oPrevButton = createElement(
      'button',
      { class: `scroller__scrollbar-btn scroller__scrollbar-btn-prev scroller__scrollbar-btn-prev-${type.toLowerCase()}` },
      Object.assign({
        width: options.buttonSize + 'px',
        height: options.buttonSize + 'px',
        borderRadius: '50%',
        border: 0,
        backgroundColor: '#e1e1e1',
        transition: 'width,height .3s linear'
      }, options.styles.button || {})
    )

    oNextButton = createElement(
      'button',
      { class: `scroller__scrollbar-btn scroller__scrollbar-btn-next scroller__scrollbar-btn-next-${type.toLowerCase()}` },
      Object.assign({
        width: options.buttonSize + 'px',
        height: options.buttonSize + 'px',
        borderRadius: '50%',
        border: 0,
        backgroundColor: '#e1e1e1',
        transition: 'width,height .3s linear'
      }, options.styles.button || {})
    )
  }

  oTrack.append(oThumb)

  oPrevButton && oBar.appendChild(oPrevButton)
  oBar.appendChild(oTrack)
  oNextButton && oBar.appendChild(oNextButton)
  
  return {
    oBar,
    oPrevButton,
    oNextButton,
    oThumb,
    oTrack
  }
}
