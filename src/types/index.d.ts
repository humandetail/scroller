export interface ScrollerOptions {
  /**
   * 应用于每个鼠标滚轮步骤的滚动量
   * @defaults 20
   */
  wheelStep: number;
  /**
   * 容器的宽度
   * @defaults 'auto'
   */
  width: string;
  /**
   * 容器的高度
   * @defaults '100vh'
   */
  height: string;
  /**
   * 滚动条的宽度
   * @defaults 10
   */
  scrollbarWidth: number;
  /**
   * 滚动条按钮的尺寸
   * @defaults 10
   */
  buttonSize: number;
  /**
   * 滚动条轨道的宽度
   * @defaults 10
   */
  trackWidth: number;
  /**
   * 滚动条滑块的宽度
   * @defaults 10
   */
  thumbWidth: number;
  /**
   * 是否监听窗口的 resize 事件
   * @defaults true
   */
  resize: boolean;
  /**
   * 是否监听 DOM 变化
   * @defaults true
   */
  observe: boolean;

  /**
   * 触底/触顶偏移量
   * top right, bottom, left
   * @defaults
   * {
   *   top: 0,
   *   right: 0,
   *   bottom: 0,
   *   left: 0
   * }
   */
  reachOffset: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  },
  /** 是否需要上下按钮 */
  button: boolean;
  /** 滚动条样式 */
  styles: {
    bar?: Partial<CSSStyleDeclaration>,
    button?: Partial<CSSStyleDeclaration>,
    track?: Partial<CSSStyleDeclaration>,
    thumb?: Partial<CSSStyleDeclaration>
  }
}

export type ScrollbarType = 'X' | 'Y'

export type EventType = 'refresh' | 'reachbottom' | 'reachtop' | 'reachleft' | 'reachright'

export type Position = {
  left: number;
  top: number;
}
