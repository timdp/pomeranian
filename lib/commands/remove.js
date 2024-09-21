import { parseComponentId } from '../maven.js'
import { pomUpdater } from '../util.js'
import { child, children, text } from '../xml.js'

export const remove = pomUpdater(async (pom, ids) => {
  const components = ids.map(parseComponentId)
  const $project = pom.documentElement
  const $dependencies = child($project, 'dependencies')
  if ($dependencies == null) {
    return
  }
  const $$dependency = children($dependencies, 'dependency')
  for (const component of components) {
    const $existing = $$dependency.find(
      ($dependency) =>
        text(child($dependency, 'groupId')) === component.groupId &&
        text(child($dependency, 'artifactId')) === component.artifactId
    )
    if ($existing == null) {
      throw new Error(
        `Dependency not found: ${component.groupId}:${component.artifactId}`
      )
    }
    $dependencies.removeChild($existing)
  }
})
