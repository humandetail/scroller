# Scroller

<p>
<a href="https://github.com/humandetail/scroller">
  <img src="https://img.shields.io/github/license/humandetail/scroller.svg" />
</a>
<a href="https://github.com/humandetail/scroller">
  <img src="https://img.shields.io/github/issues/humandetail/scroller.svg" />
</a>
<a href="https://github.com/humandetail/scroller">
  <img src="https://img.shields.io/github/forks/humandetail/scroller.svg" />
</a>
<a href="https://github.com/humandetail/scroller">
  <img src="https://img.shields.io/github/stars/humandetail/scroller.svg" />
</a>
</p>

## 📦 Install

Install with npm:

```bash
npm i @humandetail/scroller
```

Install with yarn:

```bash
yarn add @humandetail/scroller
```

## 🦄 Usage

```js
import Scroller from '@humandetail/scroller'

const scroller = new Scroller('.content', {
  height: '500px'
})
```

##  📖 Params

| 参数           | 类型    | 初始值                                                       | 说明                           |
| -------------- | ------- | ------------------------------------------------------------ | ------------------------------ |
| wheelStep      | number  | 20                                                           | 应用于每个鼠标滚轮步骤的滚动量 |
| width          | string  | auto                                                         | 容器的宽度                     |
| height         | string  | 100vh                                                        | 容器的高度                     |
| scrollbarWidth | number  | 10                                                           | 滚动条的宽度                   |
| buttonSize     | number  | 10                                                           | 滚动条按钮的尺寸               |
| trackWidth     | number  | 10                                                           | 滚动条轨道的宽度               |
| thumbWidth     | number  | 10                                                           | 滚动条滑块的宽度               |
| resize         | boolean | true                                                         | 是否监听窗口的 resize 事件     |
| observe        | boolean | true                                                         | 是否监听 DOM 变化              |
| reachOffset    | object  | { top: number; right: number; bottom: number; left: number; } | 触底/触顶偏移量                |
| button         | boolean | true                                                         | 是否需要上下按钮               |
| styles         | object  | { bar?: *Partial*<*CSSStyleDeclaration*>; button?: *Partial*<*CSSStyleDeclaration*>; track?: *Partial*<*CSSStyleDeclaration*>; thumb?: *Partial*<*CSSStyleDeclaration*>; } | 滚动条样式                     |

## 📄 License

[MIT License](https://github.com/humandetail/scroller/blob/main/LICENSE) © 2019-PRESENT [Humandetail](https://github.com/humandetail)
