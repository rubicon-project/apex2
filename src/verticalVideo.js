/* eslint-env browser */
import { createElement } from 'src/lib/dom';

const defaultParams = {
  parallaxStepCoefficient: 5, // parallax speed (greater - slower)
  stopScroll: { // can be set to "false"
    delay: 1000, // scroll disabled time
    rangeArea: 200, // -200>X<200 - px distance top or bottom to stick scroll
    scrollToTreshold: 200 // treshold scroll speed to skip sticking if user scrolls slowly
  },
  resizeRangeAspectRatio: 0.2 // value enough to avoid resize after mobile toolbars hide/collapse
};
/**
 * @class respresenting vertical video functionality
 */
export default class VerticalVideo {
  /**
   * @param {HTMLElement} player wrapper element
   * @param {Number} coefficient parallax intensivity (greater - slower)
   */
  constructor (
    playerWrapper,
    { parallaxStepCoefficient, stopScroll, resizeRangeAspectRatio } = defaultParams
  ) {
    this.playerWrapper = playerWrapper;
    this.parallaxStepCoefficient = parallaxStepCoefficient;
    this.stopScroll = stopScroll;
    this.resizeRangeAspectRatio = resizeRangeAspectRatio;
    this.fakeWrapper = createElement(document, 'div');

    // handleEvent here to bind instance context on removeEventListener
    this.scrollListener = {
      handleEvent: () => {
        const { top } = this.playerWrapper.getBoundingClientRect();
        this.setParallaxTransformPosition(top);
        if (this.stopScroll) {
          this.stickScrollTemporarily(top, this.stopScroll);
        }
      }
    };
    this.resizeListener = {
      handleEvent: () => {
        if (this.isResized()) {
          this.resize();
        }
      }
    };
  }

  /**
   * @param { Object } jwplayer object after setup
   * @param { HTMLElement } element to apply prallax transform animation effect
   */
  initialize (jwplayer, elementToParallax) {
    this.playerFrame = this.playerWrapper.firstChild;

    jwplayer.on('ready', () => {
      this.elementToParallax = elementToParallax || this.playerFrame.contentDocument.querySelector('.jw-media');
      this.elementToParallax.style.willChange = 'transform';
      this.playerWrapper.style.left = 0;
      this.playerWrapper.style.position = 'absolute';
      this.playerWrapper.style.zIndex = 999;
      this.playerWrapper.style.background = '#000';
      this.setWrapperTopPosition();
    }, this);

    jwplayer.on('beforePlay', () => {
      // remove jwplayer backdrop animation to increase parallax performance
      this.playerFrame.contentDocument.querySelector('.jw-controls-backdrop').remove();

      window.addEventListener('scroll', this.scrollListener);
      window.addEventListener('resize', this.resizeListener);
      this.resize();
    }, this);

    jwplayer.on('complete', () => {
      this.destroy();
    }, this);
  }

  resize () {
    this.setWrapperTopPosition();
    this.setParallaxTransformPosition();
    const jwAspectElement = this.playerFrame.contentDocument.querySelector('.jw-aspect');
    const aspectRatio = window.innerHeight / window.innerWidth;
    const wideScreen = 16 / 9; // 1.7
    this.playerWrapper.style.height = 'auto';
    if (aspectRatio < 1.3) { // 1 = square (greater - more vertical like)
      this.playerFrame.style.width = `${(aspectRatio * 100) / wideScreen}%`;
    } else {
      this.playerFrame.style.width = '100%';
    }
    const playerHeight = jwAspectElement.offsetHeight;
    // decrease wrapper height to parallaxTransformShiftValue if device ratio cause black lines
    if (aspectRatio > 1.9) {
      this.playerWrapper.style.height = `${playerHeight - Math.floor(this.parallaxTransformShiftValue)}px`;
    }

    this.fakeWrapper.style.height = `${playerHeight}px`;
    this.playerFrame.style.height = 'auto';
    // remember aspectRatio to avoid unexcepted trigering
    this.lastAspectRatio = aspectRatio;
  }

  destroy () {
    window.removeEventListener('scroll', this.scrollListener);
    window.removeEventListener('resize', this.resizeListener);
    this.fakeWrapper.remove();
  }

  setWrapperTopPosition () {
    const { top } = this.fakeWrapper.getBoundingClientRect();
    this.playerWrapper.style.top = `${top + document.documentElement.scrollTop}px`;
  }

  setParallaxTransformPosition (wrapperTopClientRect = 0) {
    this.parallaxTransformShiftValue = wrapperTopClientRect / this.parallaxStepCoefficient;
    this.elementToParallax.style.transform = `translateY(${-this.parallaxTransformShiftValue}px) translateZ(0)`;
  }

  isResized () {
    const aspectRatio = window.innerHeight / window.innerWidth;
    const differenceRatio = Math.abs(this.lastAspectRatio - aspectRatio);
    return differenceRatio > this.resizeRangeAspectRatio;
  }

  stickScrollTemporarily (wrapperTopClientRect, { delay, rangeArea, scrollToTreshold }) {
    if (wrapperTopClientRect > -rangeArea && wrapperTopClientRect < rangeArea) {
      const delta = Math.abs(this.lastScrollTop - wrapperTopClientRect);
      if (delta < scrollToTreshold) return;

      window.scrollTo({
        top: this.playerWrapper.offsetTop,
        behavior: 'smooth'
      });

      document.documentElement.style.overflowY = 'hidden';
      setTimeout(() => {
        document.documentElement.style.overflowY = 'auto';
      }, delay);
    }
    this.lastScrollTop = wrapperTopClientRect;
  }
}
