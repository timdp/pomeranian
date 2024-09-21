import pMap from 'p-map'

import { resolveComponentId } from '../maven.js'
import { pomUpdater } from '../util.js'
import {
  child,
  children,
  createChild,
  ensureChild,
  removeChildren,
  text,
} from '../xml.js'

const DEPENDENCY_CHILD_TAG_NAME_ORDER = [
  'groupId',
  'artifactId',
  'version',
  'scope',
]

const addAllDependencies = ($dependencies, components, scope) => {
  const $$dependency = children($dependencies, 'dependency')
  for (const component of components) {
    const $existing = $$dependency.find(
      ($dependency) =>
        text(child($dependency, 'groupId')) === component.groupId &&
        text(child($dependency, 'artifactId')) === component.artifactId
    )
    if ($existing == null) {
      const $dependency = createChild($dependencies, 'dependency')
      createChild($dependency, 'groupId', component.groupId)
      createChild($dependency, 'artifactId', component.artifactId)
      createChild($dependency, 'version', component.version)
      createChild($dependency, 'scope', scope)
    } else {
      const $version = ensureChild($existing, 'version')
      $version.textContent = component.version
      const $scope = ensureChild($existing, 'scope')
      $scope.textContent = scope
    }
  }
}

const byDependencyChildTagNameOrder = ($a, $b) =>
  DEPENDENCY_CHILD_TAG_NAME_ORDER.indexOf($a.tagName) -
  DEPENDENCY_CHILD_TAG_NAME_ORDER.indexOf($b.tagName)

const normalizeDependencies = ($dependencies) => {
  const $$dependency = children($dependencies, 'dependency')
  for (const $dependency of $$dependency) {
    const $$childElements = Array.from($dependency.childNodes)
      .filter((node) => node.nodeType === node.ELEMENT_NODE)
      .toSorted(byDependencyChildTagNameOrder)
    removeChildren($dependency)
    for (const $child of $$childElements) {
      $dependency.appendChild($child)
    }
  }
}

export const add = pomUpdater(async (pom, ids, scope) => {
  const components = await pMap(ids, resolveComponentId)
  const $project = pom.documentElement
  const $dependencies = ensureChild($project, 'dependencies')
  addAllDependencies($dependencies, components, scope)
  normalizeDependencies($dependencies)
})
