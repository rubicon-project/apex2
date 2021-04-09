/* eslint-env jest, browser */
import VerticalVideo from 'src/verticalVideo';

jest.useFakeTimers();

const randomValue = 999;
const elements = {};
const apexWrapper = document.createElement('div');
beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 590 });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1100 });

  document.body.innerHTML = `
    <div>
      <div id="article">
        <p id="p1">Some words</p>
        <p id="p2">To test</p>
        <p id="p3"></p>
        <p id="p4" class="outstream"></p>
        <p id="p5"></p>
        <p id="p6"></p>
        <p id="p7">Middle placement</p>
        <p id="p8">Of node</p>
      </div>
      <div id="aside">
        <p></p>
        <p></p>
      </div>
      <p></p>
    </div>`;

  document.querySelector('.outstream').after(apexWrapper);
  apexWrapper.innerHTML = `<iframe id="MagniteApex-iframe-${randomValue}" />`;
  elements.iframe = document.querySelector(`#MagniteApex-iframe-${randomValue}`);
  elements.iframeDocument = elements.iframe.contentDocument;

  const { iframeDocument } = elements;
  const content = '<html><body style="margin: 0px; padding: 0px; overflow: hidden"><div class="jw-controls-backdrop"></div><div class="jw-aspect"></div><div class="jw-media"></div></body></html>';
  iframeDocument.open('text/html', 'replace');
  iframeDocument.write(content);
  iframeDocument.close();

  iframeDocument.querySelector('.jw-aspect').style.width = '100vw';
});

describe('src/verticalVideo', () => {
  test('playerWrapper created on class instance', () => {
    const verticalVideoInstance = new VerticalVideo(apexWrapper);
    expect(verticalVideoInstance.playerWrapper).toEqual(apexWrapper);
  });

  it('should be VerticalVideo class instance', () => {
    const verticalVideoInstance = new VerticalVideo(apexWrapper);
    expect(verticalVideoInstance).toBeInstanceOf(VerticalVideo);
  });

  test('fakeWrapper element created', () => {
    const verticalVideoInstance = new VerticalVideo(apexWrapper);
    expect(verticalVideoInstance.fakeWrapper).toBeInstanceOf(HTMLDivElement);
  });

  let verticalVideoInstance;
  const jwplayer = {
    on (eventTypeName, callback, context) {
      this[eventTypeName] = callback.bind(context);
    }
  };

  beforeEach(() => {
    verticalVideoInstance = new VerticalVideo(apexWrapper);
    verticalVideoInstance.initialize(jwplayer);

    window.addEventListener = (eventTypeName, callback) => {
      verticalVideoInstance[`${eventTypeName}EventHandle`] = callback.handleEvent;
    };
  });

  describe('initialize', () => {
    it('should have playerFrame property iframe element', () => {
      expect(verticalVideoInstance.playerFrame).toEqual(elements.iframe);
    });

    describe('initialize/ready', () => {
      beforeEach(() => {
        verticalVideoInstance.setWrapperTopPosition = jest.fn();
        jwplayer.ready();
      });

      it('should create elementToParallax property .jw-media element', () => {
        expect(verticalVideoInstance.elementToParallax).toEqual(elements.iframeDocument.querySelector('.jw-media'));
      });

      it('should call setWrapperTopPosition on jwplayer ready', () => {
        expect(verticalVideoInstance.setWrapperTopPosition).toHaveBeenCalled();
      });

      test('call destroy on jwplayer complete', () => {
        verticalVideoInstance.destroy = jest.fn();
        jwplayer.complete();
        expect(verticalVideoInstance.destroy).toHaveBeenCalled();
      });
    });

    describe('initialize/beforePlay', () => {
      beforeEach(() => {
        verticalVideoInstance.resize = jest.fn();
        window.addEventListener = jest.fn();
        jwplayer.ready();
        jwplayer.beforePlay();
      });

      it('should remove .jw-controls-backdrop element', () => {
        expect(elements.iframeDocument.querySelector('.jw-controls-backdrop')).toBeNull();
      });

      it('should add window event listeners', () => {
        expect(window.addEventListener).toBeCalledWith('resize', verticalVideoInstance.resizeListener);
        expect(window.addEventListener).toBeCalledWith('scroll', verticalVideoInstance.scrollListener);
      });

      test('resize mehtod call', () => {
        expect(verticalVideoInstance.resize).toHaveBeenCalled();
      });
    });
  });

  describe('destroy', () => {
    window.removeEventListener = jest.fn();
    beforeEach(() => verticalVideoInstance.destroy());

    it('should remove fakeWrapper element from DOM', () => {
      expect(document.documentElement.contains(verticalVideoInstance.fakeWrapper)).toBeFalsy();
    });

    test('remove window event listeners', () => {
      expect(window.removeEventListener).toBeCalledWith('scroll', verticalVideoInstance.scrollListener);
      expect(window.removeEventListener).toBeCalledWith('resize', verticalVideoInstance.resizeListener);
    });
  });

  describe('resize', () => {
    beforeEach(() => {
      jwplayer.ready();
      jwplayer.beforePlay();
    });

    it('should call isResized and resize methods', () => {
      window.addEventListener('resize', verticalVideoInstance.resizeListener);
      verticalVideoInstance.resize = jest.fn();
      window.innerWidth = 1000;
      window.innerHeight = 1000;
      verticalVideoInstance.resizeEventHandle();
      expect(verticalVideoInstance.isResized()).toEqual(true);
      expect(verticalVideoInstance.resize).toHaveBeenCalled();
    });

    test('do not resize if differenceRatio > resizeRangeAspectRatio (0.2)', () => {
      window.addEventListener('resize', verticalVideoInstance.resizeListener);
      verticalVideoInstance.resize = jest.fn();
      verticalVideoInstance.resizeEventHandle();
      expect(verticalVideoInstance.isResized()).toEqual(false);
      expect(verticalVideoInstance.resize).not.toHaveBeenCalled();
    });

    it('should call setWrapperTopPostition', () => {
      verticalVideoInstance.setWrapperTopPosition = jest.fn();
      verticalVideoInstance.resize();
      expect(verticalVideoInstance.setWrapperTopPosition).toHaveBeenCalled();
    });

    it('should call setParallaxTransformPosition', () => {
      verticalVideoInstance.setParallaxTransformPosition = jest.fn();
      verticalVideoInstance.resize();
      expect(verticalVideoInstance.setParallaxTransformPosition).toHaveBeenCalled();
    });

    it('should change playerFrame width according aspectRatio value', () => {
      window.innerWidth = 2000;
      window.innerHeight = 1000;
      verticalVideoInstance.resize();
      const wideScreen = 16 / 9; // 1.7
      const aspectRatio = window.innerHeight / window.innerWidth; // 0.5
      expect(elements.iframe.style.width).toEqual(`${(aspectRatio * 100) / wideScreen}%`);
    });

    it('should decrease wrapper height to parallaxTransformShiftValue if device ratio cause black lines', () => {
      window.innerWidth = 600;
      window.innerHeight = 2000;
      verticalVideoInstance.resize();
      const playerHeight = elements.iframeDocument.querySelector('.jw-aspect').offsetHeight;
      expect(apexWrapper.style.height).toEqual(`${playerHeight - Math.floor(verticalVideoInstance.parallaxTransformShiftValue)}px`);
    });
  });

  describe('scroll', () => {
    window.scrollTo = jest.fn();
    beforeEach(() => {
      jwplayer.ready();
      jwplayer.beforePlay();
    });

    it('should call stickScrollTemporarily', () => {
      window.addEventListener('scroll', verticalVideoInstance.scrollListener);
      verticalVideoInstance.stickScrollTemporarily = jest.fn();
      verticalVideoInstance.scrollEventHandle();
      expect(verticalVideoInstance.stickScrollTemporarily).toHaveBeenCalled();
    });

    test('stopScroll parameter set to "false"', () => {
      verticalVideoInstance.stopScroll = false;
      window.addEventListener('scroll', verticalVideoInstance.scrollListener);
      verticalVideoInstance.stickScrollTemporarily = jest.fn();
      verticalVideoInstance.scrollEventHandle();
      expect(verticalVideoInstance.stickScrollTemporarily).not.toHaveBeenCalled();
    });

    const params = {
      delay: 1000,
      rangeArea: 200,
      scrollToTreshold: 200
    };
    it('should return after delta calculating', () => {
      verticalVideoInstance.lastScrollTop = 0;
      const wrapperTopClientRect = 199;
      verticalVideoInstance.stickScrollTemporarily(wrapperTopClientRect, params);
      expect(window.scrollTo).not.toHaveBeenCalled();
      expect(verticalVideoInstance.lastScrollTop).toEqual(0);
    });

    it('should only assign new lastScrollTop', () => {
      verticalVideoInstance.lastScrollTop = 0;
      const wrapperTopClientRect = 201;
      verticalVideoInstance.stickScrollTemporarily(wrapperTopClientRect, params);
      expect(window.scrollTo).not.toHaveBeenCalled();
      expect(verticalVideoInstance.lastScrollTop).toEqual(wrapperTopClientRect);
    });

    test('stick scroll', () => {
      verticalVideoInstance.lastScrollTop = 400;
      const wrapperTopClientRect = 100;
      verticalVideoInstance.stickScrollTemporarily(wrapperTopClientRect, params);
      expect(window.scrollTo).toHaveBeenCalled();
      expect(verticalVideoInstance.lastScrollTop).toEqual(wrapperTopClientRect);
      expect(document.documentElement.style.overflowY).toEqual('hidden');
      jest.runOnlyPendingTimers();
      expect(document.documentElement.style.overflowY).toEqual('auto');
    });
  });

  test('isResized returns bolean if differrenceratio > 0.2', () => {
    verticalVideoInstance.lastAspectRatio = 1.9;
    window.innerHeight = 1100;
    window.innerWidth = 500;
    expect(verticalVideoInstance.isResized()).toBeTruthy();
    verticalVideoInstance.lastAspectRatio = 2.1;
    expect(verticalVideoInstance.isResized()).toBeFalsy();
  });
});
