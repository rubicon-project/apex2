/* eslint-env jest,browser */
import { getPlacement, createPlayerWrapper, createPlayerFrame, createPlayerContainer, attachPlayer } from 'src/playerPlacement';

beforeEach(() => {
  // Clear JSDOM
  if (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }

  return true;
});

describe('src/playerPlacement', () => {
  describe('getPlacement', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="article"><div id="target1"></div><div id="target2" class="d"></div><div id="target3" class="d"></div></div>';
    });

    test(
      'should find placement when single placement object is passed',
      () => {
        const placement = getPlacement({ attachTo: '#target1', position: 'prepend', align: 'left' });
        expect(placement).toEqual({ attachTo: '#target1', position: 'prepend', align: 'left', node: expect.any(Object) });
        expect(placement.node.outerHTML).toBe('<div id="target1"></div>');
      }
    );

    test(
      'should find placement when multiple placements are passed',
      () => {
        const placement = getPlacement([
          { attachTo: '#target2', position: 'prepend', align: 'left' },
          { attachTo: '#target3', position: 'append', align: 'right' },
          { attachTo: '#unknown', position: 'before', align: 'center' }
        ]);
        expect(placement).toEqual({ attachTo: '#target2', position: 'prepend', align: 'left', node: expect.any(Object) });
        expect(placement.node.outerHTML).toBe('<div id="target2" class="d"></div>');
      }
    );

    test(
      'should find first placement which is ok',
      () => {
        const placement = getPlacement([
          { attachTo: '#unknown', position: 'before', align: 'center' },
          { attachTo: '#unknown2', position: 'prepend', align: 'left' },
          { attachTo: '#target3', position: 'append', align: 'right' },
          { attachTo: '#target2', position: 'prepend', align: 'left' },
          { attachTo: '#unknown4', position: 'prepend', align: 'left' }
        ]);
        expect(placement).toEqual({ attachTo: '#target3', position: 'append', align: 'right', node: expect.any(Object) });
        expect(placement.node.outerHTML).toBe('<div id="target3" class="d"></div>');
      }
    );

    test(
      'should return no placement when there are no suitable options',
      () => {
        const placement = getPlacement([
          { attachTo: '#unknown', position: 'before', align: 'center' },
          { attachTo: '#unknown2', position: 'prepend', align: 'left' },
          { attachTo: '#unknown4', position: 'prepend', align: 'left' }
        ]);
        expect(placement).toBeNull();
      }
    );
  });

  describe('createPlayerWrapper', () => {
    test(
      'should create wrapper element with createPlayerWrapper',
      () => {
        const randomValue = 999;
        const el = createPlayerWrapper(randomValue);
        // check
        expect(el.tagName).toEqual(expect.stringMatching(/div/i));
        expect(el.id).toBe(`MagniteApex-wrapper-${randomValue}`);
        expect(el.style.width).toBe('100%');
        expect(el.style.overflow).toBe('hidden');
        expect(el.style.position).toBe('relative');
        expect(el.style.clear).toBe('both');
        expect(el.style.display).toBe('flex');
        expect(el.style.justifyContent).toBe('center');
      }
    );

    test(
      'should align to left',
      () => {
        const randomValue = 999;
        const el = createPlayerWrapper(randomValue, 'left');
        // check
        expect(el.style.justifyContent).toBe('flex-start');
      }
    );

    test(
      'should align to right',
      () => {
        const randomValue = 999;
        const el = createPlayerWrapper(randomValue, 'right');
        // check
        expect(el.style.justifyContent).toBe('flex-end');
      }
    );
  });

  describe('createPlayerFrame', () => {
    test(
      'should create iframe element with createPlayerFrame',
      () => {
        const randomValue = 999;
        const targetId = 'Magnite-Target';
        const el = createPlayerFrame(targetId, 500, randomValue);
        // check
        expect(el.tagName).toEqual(expect.stringMatching(/iframe/i));
        expect(el.id).toBe(`MagniteApex-iframe-${randomValue}`);
        expect(el.style.backgroundColor).toBe('transparent');
        expect(el.style.border).toBe('0px none transparent');
        expect(el.style.margin).toBe('0px');
        expect(el.style.padding).toBe('0px');
        expect(el.style.overflow).toBe('hidden');
        expect(el.style.width).toBe('500px');
        expect(el.style.height).toBe('1px');
        expect(el.style.display).toBe('block');
        expect(el.contentWindow).toBeNull();
      }
    );
  });

  describe('createPlayerContainer', () => {
    test(
      'should create div element with createPlayerContainer',
      () => {
        const targetId = 'Magnite-Target-999';
        const el = createPlayerContainer(targetId, 400);
        // check
        expect(el.tagName).toEqual(expect.stringMatching(/div/i));
        expect(el.id).toBe(targetId);
        expect(el.style.backgroundColor).toBe('transparent');
        expect(el.style.border).toBe('0px none transparent');
        expect(el.style.margin).toBe('0px');
        expect(el.style.padding).toBe('0px');
        expect(el.style.overflow).toBe('hidden');
        expect(el.style.width).toBe('400px');
        expect(el.style.height).toBe('');
        expect(el.style.display).toBe('block');
      }
    );
  });

  describe('attachPlayer', () => {
    let targetNode;
    let playerNode;
    beforeEach(() => {
      document.body.innerHTML = '<div id="article"><div id="target"><p>Some text before</p><p>Some text after</p></div></div>';
      targetNode = document.getElementById('target');
      playerNode = document.createElement('div');
      playerNode.setAttribute('id', 'playerWrapper');
    });

    test(
      'should attach after placement by default',
      () => {
        attachPlayer(undefined, targetNode, playerNode);
        expect(document.body.innerHTML).toEqual(
          '<div id="article"><div id="target"><p>Some text before</p><p>Some text after</p></div><div id="playerWrapper"></div></div>'
        );
      }
    );

    test(
      'should attach before target node',
      () => {
        attachPlayer('before', targetNode, playerNode);
        expect(document.body.innerHTML).toEqual(
          '<div id="article"><div id="playerWrapper"></div><div id="target"><p>Some text before</p><p>Some text after</p></div></div>'
        );
      }
    );

    test(
      'should append inside target node',
      () => {
        attachPlayer('append', targetNode, playerNode);
        expect(document.body.innerHTML).toEqual(
          '<div id="article"><div id="target"><p>Some text before</p><p>Some text after</p><div id="playerWrapper"></div></div></div>'
        );
      }
    );

    test(
      'should prepend inside target node',
      () => {
        attachPlayer('prepend', targetNode, playerNode);
        expect(document.body.innerHTML).toEqual(
          '<div id="article"><div id="target"><div id="playerWrapper"></div><p>Some text before</p><p>Some text after</p></div></div>'
        );
      }
    );
  });
});
