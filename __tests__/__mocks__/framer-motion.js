// framer-motionのモック
import React from 'react';

const mockAnimate = jest.fn();
const mockWhileInView = jest.fn();
const mockInitial = jest.fn();
const mockTransition = jest.fn();
const mockViewport = jest.fn();

// motion.divなどのコンポーネントをモック化
const createMotionComponent = (Component) => {
  return ({ children, ...props }) => {
    // アニメーションプロパティをキャプチャ
    if (props.animate) mockAnimate(props.animate);
    if (props.whileInView) mockWhileInView(props.whileInView);
    if (props.initial) mockInitial(props.initial);
    if (props.transition) mockTransition(props.transition);
    if (props.viewport) mockViewport(props.viewport);
    
    // 元のコンポーネントを返す（アニメーションプロパティなし）
    const restProps = {};
    Object.keys(props).forEach(key => {
      if (!['animate', 'whileInView', 'initial', 'transition', 'viewport'].includes(key)) {
        restProps[key] = props[key];
      }
    });
    
    return Component({ children, ...restProps });
  };
};

// motion オブジェクトをモック
const motion = new Proxy({}, {
  get: (_, prop) => {
    if (prop === '_forTest') {
      return {
        mockAnimate,
        mockWhileInView,
        mockInitial,
        mockTransition,
        mockViewport,
      };
    }
    
    // HTML要素の場合
    return createMotionComponent((props) => {
      const { children, ...rest } = props;
      return React.createElement(prop, rest, children);
    });
  }
});

// AnimatePresenceをモック
const AnimatePresence = ({ children }) => children;

module.exports = {
  motion,
  AnimatePresence,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  useInView: () => true,
  useScroll: () => ({
    scrollYProgress: { get: () => 0, onChange: jest.fn() },
  }),
}; 