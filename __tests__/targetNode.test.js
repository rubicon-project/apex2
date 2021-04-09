/* eslint-env jest, browser */

import getTargetNode, { getMainNode } from 'src/targetNode';

beforeEach(() => {
  // Clear JSDOM
  if (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }

  return true;
});

describe('src/placement', () => {
  beforeEach(() => {
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

    // define innerText property becaouse it's undefined with jsdom
    const pElements = document.getElementsByTagName('p');
    [...pElements].forEach((element) => {
      Object.defineProperty(element, 'innerText', { value: element.textContent, writable: true });
    });
  });

  describe('getMainNode', () => {
    it(
      'should return main DOM item (with max words in p tags)',
      () => {
        const aside = document.querySelector('#aside');
        aside.firstElementChild.innerText = 'Few more words to test getMainNode function if aside has more words than article';
        expect(getMainNode('p').node).toEqual(aside);
      }
    );
  });

  describe('getTargetNode', () => {
    it(
      'should autoplace to body when no "p" tags',
      () => {
        document.body.outerHTML = '';
        const target = getTargetNode({ attachTo: 'top' });
        expect(target).toEqual({ attachTo: 'top', node: expect.any(Object), position: 'prepend' });
        expect(target.node).toBe(document.body);
      }
    );
    it(
      'should return DOM item for autoplace, location = top',
      () => {
        const target = getTargetNode({ attachTo: 'top', position: 'append', align: 'left' });
        expect(target).toEqual({ attachTo: 'top', position: 'before', align: 'left', node: expect.any(Object) });
        expect(target.node).toBe(document.querySelector('#p1'));
      }
    );
    it(
      'should return DOM item for autoplace, location = bottom',
      () => {
        const target = getTargetNode({ attachTo: 'bottom', position: 'append', align: 'left' });
        expect(target).toEqual({ attachTo: 'bottom', position: 'append', align: 'left', node: expect.any(Object) });
        expect(target.node).toBe(document.querySelector('#p8'));
      }
    );

    it(
      'should return DOM item for autoplace, location = middle',
      () => {
        const target = getTargetNode({ attachTo: 'middle', position: 'before', align: 'left' });
        expect(target).toEqual({ attachTo: 'middle', position: 'before', align: 'left', node: expect.any(Object) });
        expect(target.node).toBe(document.querySelector('#p4'));
      }
    );

    test(
      'should find node when CSS selector is passed (id)',
      () => {
        const target = getTargetNode({ attachTo: '#p1', position: 'append', align: 'left' });
        expect(target).toEqual({ attachTo: '#p1', position: 'append', align: 'left', node: expect.any(Object) });
        expect(target.node).toBe(document.querySelector('#p1'));
      }
    );

    test(
      'should find node when CSS selector is passed (class)',
      () => {
        const target = getTargetNode({ attachTo: '.outstream', position: 'append', align: 'left' });
        expect(target).toEqual({ attachTo: '.outstream', position: 'append', align: 'left', node: expect.any(Object) });
        expect(target.node).toBe(document.querySelector('.outstream'));
      }
    );

    test(
      'should not find node when no matches for CSS selector are found',
      () => {
        const target = getTargetNode({ attachTo: '#unknown', position: 'append', align: 'left' });
        expect(target).toEqual({ attachTo: '#unknown', position: 'append', align: 'left', node: null });
      }
    );

    test(
      'should use "top" as default value for attachTo',
      () => {
        const target = getTargetNode({ position: 'append', align: 'left' });
        expect(target).toEqual({ position: 'before', align: 'left', node: expect.any(Object) });
        expect(target.node).toBe(document.querySelector('#p1'));
      }
    );
  });
});
