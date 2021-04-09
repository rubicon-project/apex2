/* eslint-env browser */
/**
 * Functions to determine target DOM node to attach Apex
 * @module targetNode
*/

/**
 * Counts number of words in DOM element
 * @param {Object} DOM element
 * @returns {Number} word count
 */
function getWordsCount ({ innerText }) {
  return innerText.split(' ').length;
}

/**
 * Get main text node
 * @param {String} tagName Tag name of elements to search
 * @returns {Object} DOM element of the main node and the number of words in it
 */
export function getMainNode (tagName) {
  const parentElements = [];
  const elements = document.getElementsByTagName(tagName);
  [...elements].forEach((pElement) => {
    const { parentNode } = pElement;
    const wordsCount = getWordsCount(pElement);

    const createdNodeIndex = parentElements.findIndex((elem) => elem === parentNode);

    if (createdNodeIndex === -1) {
      parentElements.push(parentNode);
      parentElements[parentElements.length - 1].wordsCount = wordsCount;
    } else {
      parentElements[createdNodeIndex].wordsCount += wordsCount;
    }
  });

  const maxWordsNode = parentElements.reduce(
    (prev, curr) => (prev.wordsCount > curr.wordsCount ? prev : curr)
  );
  const maxWordsNodeElements = [...maxWordsNode.getElementsByTagName(tagName)];
  return {
    node: maxWordsNode,
    elements: maxWordsNodeElements
  };
}

/**
 * Get middle node of the article text
 * @param {NodeList} parentElements List of paragraph elements
 * @param {Number} parentWordsCount Word count of the article
 * @returns {HTMLElement} Middle article paragraph node
 */
function getMiddleNode (parentElements, parentWordsCount) {
  const wordsMidCount = Math.floor(parentWordsCount / 2);
  let words = 0;
  return parentElements.find((current) => {
    words += getWordsCount(current);
    return words >= wordsMidCount;
  });
}

/**
 * Determine automatic placement
 * @param {String} attachTo   Autoplacement option (top|middle|bottom)
 * @param {String} tagName    Tag name for the main text node
 * @returns {Object} Overrides for the placement object
 */
export function getAutoPlacement (attachTo, tagName) {
  const { elements, node } = getMainNode(tagName);

  if (attachTo === 'bottom') {
    return { node: elements[elements.length - 1] };
  }
  if (attachTo === 'middle') {
    return { node: getMiddleNode(elements, node.wordsCount) };
  }

  return { // attachTo === 'top'
    node: elements[0],
    position: 'before'
  };
}

/**
 * Determine DOM node where to attach Apex
 * @function getTargetNode
 * @param {Object} parameters   Placement parameters
 * @param {String} tagName      Main tag name of the article
 * @returns {Object} New placement object
 */
export default function getTargetNode (parameters, tagName = 'p') {
  let mergeParameters = {};
  let { attachTo } = parameters;
  if (!attachTo) {
    attachTo = 'top'; // default attach option
  }

  if (/^(top|middle|bottom)$/.test(attachTo)) {
    const elementsByTag = document.getElementsByTagName(tagName);
    if (elementsByTag.length === 0) {
      // special case - attaching to empty document
      mergeParameters = {
        node: document.getElementsByTagName('body')[0],
        position: 'prepend'
      };
    } else {
      mergeParameters = getAutoPlacement(attachTo, tagName);
    }
  } else {
    mergeParameters.node = document.querySelector(attachTo);
  }

  return {
    ...parameters,
    ...mergeParameters
  };
}
