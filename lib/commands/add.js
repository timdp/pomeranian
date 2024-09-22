import ansiColors from 'ansi-colors'
import pMap from 'p-map'

import {
  getLatestComponentVersion,
  parseComponentId,
  performComponentSearch,
} from '../maven.js'
import { select } from '../ui.js'
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

const SEPARATOR = ansiColors.dim(':')

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

const searchComponentAndChoose = async (id) => {
  const candidates = await performComponentSearch(id)
  if (candidates.length === 0) {
    throw new Error(`No matching components found: ${id}`)
  }
  // TODO Extract console output from this module
  const selectedIndex = await select(
    `${id} →`,
    candidates.map(({ groupId, artifactId, version }, index) => ({
      name: [groupId, artifactId, version]
        .filter((s) => s != null)
        .join(SEPARATOR),
      value: index,
    }))
  )
  return candidates[selectedIndex]
}

const resolveComponentIds = async (ids) => {
  const components = ids.map(parseComponentId)
  const unparsedIdIndices = components
    .map((component, i) => (component == null ? i : null))
    .filter((i) => i != null)
  if (unparsedIdIndices.length > 0) {
    for (const i of unparsedIdIndices) {
      components[i] = await searchComponentAndChoose(ids[i])
    }
    console.info()
  }
  const componentsWithoutVersion = components.filter(
    (component) => component.version == null
  )
  await pMap(componentsWithoutVersion, async (component) => {
    component.version = await getLatestComponentVersion(
      component.groupId,
      component.artifactId
    )
  })
  return components
}

export const add = pomUpdater(async (pom, ids, scope) => {
  const components = await resolveComponentIds(ids)
  const $project = pom.documentElement
  const $dependencies = ensureChild($project, 'dependencies')
  addAllDependencies($dependencies, components, scope)
  normalizeDependencies($dependencies)
})
