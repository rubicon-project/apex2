/* eslint-env jest,browser */

import createCloseButton from 'src/player/createCloseButton';

// test-wide parameters
let spyAppendContainer;

let plContainer;
let options;
const videoUrl = 'http://test.com/';
const closeClass = 'magnite-apex-close';

const JWPlayerController = {};

const styleMobile = {
  width: '20px',
  height: '20px',
  marginTop: '0px',
  marginRight: '0px',
  // background-image is dynamic
  display: 'block',
  textAlign: 'right',
  textDecoration: 'none',
  bottom: '-12px'
};

const styleDesktop = {
  width: '20px',
  height: '20px',
  marginTop: '0px',
  marginRight: '0px',
  // background-image is dynamic
  display: 'block',
  textAlign: 'right',
  textDecoration: 'none',
  bottom: '-12px'
};

beforeAll(() => {
  JWPlayerController.remove = jest.fn();
  return true;
});

beforeEach(() => {
  // clear mock data before each test
  plContainer = document.createElement('div');
  options = {
    closeButton: true,
    isMobile: false,
    content_video_url: videoUrl
  };
  styleDesktop.backgroundImage = 'url(test-file-stub)';
  styleMobile.backgroundImage = 'url(test-file-stub)';
  spyAppendContainer = jest.spyOn(plContainer, 'appendChild');
  // clear mock functions
  JWPlayerController.remove.mockClear();
  return true;
});

function dispatchEvent (el, ev) {
  el.dispatchEvent(new Event(ev, { cancelable: true }));
}

// ** run tests
describe('src/player/createCloseButton', () => {
  it(
    'should not create close button when closeButton is false', () => {
      options.closeButton = false;
      createCloseButton(plContainer, options, JWPlayerController);
      expect(spyAppendContainer).not.toHaveBeenCalled();
    }
  );

  it('should create close button when closeButton is true (desktop)', () => {
    options.closeButton = true;
    options.isMobile = false;
    const style = styleDesktop;
    // test
    createCloseButton(plContainer, options, JWPlayerController);
    // check
    expect(spyAppendContainer).toHaveBeenCalled();
    const div = plContainer.firstChild;
    expect(div.className).toBe(closeClass);
    expect(div.style.width).toBe(style.width);
    expect(div.style.height).toBe(style.height);
    expect(div.style.marginTop).toBe(style.marginTop);
    expect(div.style.marginRight).toBe(style.marginRight);
    expect(div.style.backgroundImage).toBe(style.backgroundImage);
    expect(div.style.display).toBe(style.display);
  });

  it('should create close button when closeButton is true (mobile)', () => {
    options.closeButton = true;
    options.isMobile = true;
    const style = styleMobile;
    // test
    createCloseButton(plContainer, options, JWPlayerController);
    // check
    expect(spyAppendContainer).toHaveBeenCalled();
    const div = plContainer.firstChild;
    expect(div.className).toBe(closeClass);
    expect(div.style.width).toBe(style.width);
    expect(div.style.height).toBe(style.height);
    expect(div.style.marginTop).toBe(style.marginTop);
    expect(div.style.marginRight).toBe(style.marginRight);
    expect(div.style.backgroundImage).toBe(style.backgroundImage);
    expect(div.style.display).toBe(style.display);
  });

  it('should add click listener on desktop (desktop)', () => {
    options.isMobile = false;
    // test
    createCloseButton(plContainer, options, JWPlayerController);

    // check
    const div = plContainer.firstChild;
    dispatchEvent(div, 'touchend');
    expect(JWPlayerController.remove).not.toHaveBeenCalled();
    dispatchEvent(div, 'click');
    expect(JWPlayerController.remove).toHaveBeenCalled();
  });

  it('should add touchend listener on mobile (mobile)', () => {
    options.isMobile = true;
    // test
    createCloseButton(plContainer, options, JWPlayerController);
    // check
    const div = plContainer.firstChild;
    dispatchEvent(div, 'click');
    expect(JWPlayerController.remove).not.toHaveBeenCalled();

    dispatchEvent(div, 'touchend');
    expect(JWPlayerController.remove).toHaveBeenCalled();
  });
});
