import { parseComponentId } from '../maven.js'
import { pomUpdater } from '../util.js'
import { child, children, text } from '../xml.js'

export const remove = pomUpdater(async (pom, ids) => {
  const components = ids
    .map(parseComponentId)
    .map((component, i) => component ?? { groupId: null, artifactId: ids[i] })
  const $project = pom.documentElement
  const $dependencies = child($project, 'dependencies')
  if ($dependencies == null) {
    throw new Error('No dependencies found in POM')
  }
  const $$dependency = children($dependencies, 'dependency')
  for (const component of components) {
    const $existing = $$dependency.find(
      ($dependency) =>
        (component.groupId == null ||
          text(child($dependency, 'groupId')) === component.groupId) &&
        text(child($dependency, 'artifactId')) === component.artifactId
    )
    if ($existing == null) {
      throw new Error(
        `Dependency not found in POM: ${component.groupId ?? '*'}:${component.artifactId}`
      )
    }
    $dependencies.removeChild($existing)
  }
})
