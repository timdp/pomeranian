import pMap from 'p-map'

import { resolveComponentId } from '../maven.js'
import { pomUpdater } from '../util.js'
import { child, children, createChild, ensureChild, text } from '../xml.js'

export const add = pomUpdater(async (pom, ids, scope) => {
  const components = await pMap(ids, resolveComponentId)
  const $project = pom.documentElement
  const $dependencies = ensureChild($project, 'dependencies')
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
})
