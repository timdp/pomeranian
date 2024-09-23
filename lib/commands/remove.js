import { parseComponentId } from '../maven.js'
import { pomUpdater } from '../util.js'
import { child, children, text } from '../xml.js'

const patternToRegexp = (pattern) =>
  new RegExp(pattern.replace(/\W/, (chr) => (chr === '*' ? '.*' : '\\' + chr)))

const createArtifactMatcher = (artifactIdPattern) => {
  const artifactIdRegexp = patternToRegexp(artifactIdPattern)
  return {
    label: '*:' + artifactIdPattern,
    test: (_, artifactId) => artifactIdRegexp.test(artifactId),
  }
}

const createComponentMatcher = (groupIdPattern, artifactIdPattern) => {
  const groupIdRegexp = patternToRegexp(groupIdPattern)
  const artifactIdRegexp = patternToRegexp(artifactIdPattern)
  return {
    label: groupIdPattern + ':' + artifactIdPattern,
    test: (groupId, artifactId) =>
      groupIdRegexp.test(groupId) && artifactIdRegexp.test(artifactId),
  }
}

export const remove = pomUpdater(async (pom, ids) => {
  const matchers = ids
    .map(parseComponentId)
    .map((component, i) =>
      component == null
        ? createArtifactMatcher(ids[i])
        : createComponentMatcher(component.groupId, component.artifactId)
    )
  const $project = pom.documentElement
  const $dependencies = child($project, 'dependencies')
  if ($dependencies == null) {
    throw new Error('No dependencies found in POM')
  }
  const $$dependency = children($dependencies, 'dependency')
  for (const matcher of matchers) {
    const $$existing = $$dependency.filter(($dependency) =>
      matcher.test(
        text(child($dependency, 'groupId')),
        text(child($dependency, 'artifactId'))
      )
    )
    if ($$existing.length === 0) {
      throw new Error(`Dependency not found in POM: ${matcher.label}`)
    }
    for (const $child of $$existing) {
      $dependencies.removeChild($child)
    }
  }
})
