/* eslint-env jest, browser */
import { createElement, createScriptElement, createImage, getMarginHeight } from 'src/lib/dom';

const el = {
  'margin-top': '20px',
  'margin-bottom': '20px',
  getPropertyValue (propName) {
    return this[propName];
  }
};

beforeAll(() => {
  document.defaultView.getComputedStyle = jest.fn((element) => element);
});

beforeEach(() => {
  // Clear JSDOM
  if (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }

  global.Image = function Image () {
    if (typeof Image.instance === 'object') {
      return Image.instance;
    }
    this.src = '';
    Image.instance = this;
    return this;
  };
});

describe('src/lib/dom', () => {
  describe('createElement', () => {
    it('creates element without attributes', () => {
      const htmlElement = createElement(document, 'div');
      expect(htmlElement.outerHTML).toEqual('<div></div>');
    });

    it('creates element with attributes', () => {
      const htmlElement = createElement(document, 'div', { width: 640, height: 480 });
      expect(htmlElement.outerHTML).toEqual('<div width="640" height="480"></div>');
    });

    it('creates element with style', () => {
      const htmlElement = createElement(document, 'div', { width: 640, height: 480, style: { color: '#FFFFFF', 'font-weight': 'bold' } });
      expect(htmlElement.outerHTML).toEqual('<div width="640" height="480" style="color:#FFFFFF;font-weight:bold"></div>');
    });

    it('creates element with attributes and content', () => {
      const htmlElement = createElement(document, 'div', { width: 640, height: 480 }, 'Hello world');
      expect(htmlElement.outerHTML).toEqual('<div width="640" height="480">Hello world</div>');
    });
  });

  describe('createScriptElement', () => {
    it('creates script element', () => {
      const callback = jest.fn();
      const scriptUrl = 'http://example.test/example.js';
      createScriptElement(document, scriptUrl, callback);
      expect(document.scripts[0].outerHTML).toEqual(`<script type="text/javascript" src="${scriptUrl}"></script>`);
      expect(callback).not.toHaveBeenCalled();
      document.scripts[0].onload();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('createImage', () => {
    it('should create image with correct src', () => {
      const img1 = 'https://example.test/image1.jpg';
      createImage(img1);
      expect(new global.Image()).toEqual({
        src: img1
      });
      const img2 = 'https://example.test/image2.jpg';
      createImage(img2);
      expect(new global.Image()).toEqual({
        src: img2
      });
    });
  });

  describe('getMarginHeight', () => {
    it('should return margin-top and margin-bottom of DOM element', () => {
      expect(getMarginHeight(el)).toBe(40);
    });

    it('should return call document.defaultView.getComputedStyle', () => {
      getMarginHeight(el);
      expect(document.defaultView.getComputedStyle).toHaveBeenCalled();
    });
  });
});
