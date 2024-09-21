import formatXml from 'xml-formatter'
import { DOMParser, XMLSerializer } from 'xmldom'

export const parseXml = (xml) =>
  new DOMParser().parseFromString(xml, 'text/xml')

export const serializeXml = (doc) =>
  formatXml(new XMLSerializer().serializeToString(doc), {
    collapseContent: true,
  })

export const children = ($node, name) =>
  Array.from($node.childNodes).filter(($child) => $child.tagName === name)

export const child = ($node, name) => children($node, name)[0]

export const createChild = ($node, name, textContent = null) => {
  const $child = $node.ownerDocument.createElement(name)
  if (textContent != null) {
    $child.textContent = textContent
  }
  $node.appendChild($child)
  return $child
}

export const ensureChild = ($node, name) =>
  child($node, name) ?? createChild($node, name)

export const text = ($node) => $node.textContent?.trim()
