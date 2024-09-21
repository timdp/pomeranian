import ky from 'ky'

const componentIdMatchers = [
  /^(?:https?:)?\/\/[^/]+\/artifact\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/,
  /^([A-Za-z0-9-.]+):([A-Za-z0-9-.]+)(?::([^:]+))?$/,
]

const determineLatestVersion = async (component) => {
  const url =
    'https://central.sonatype.com/api/internal/browse/component/versions?' +
    new URLSearchParams({
      sortField: 'normalizedVersion',
      sortDirection: 'desc',
      size: '1',
      filter: `namespace:${component.groupId},name:${component.artifactId}`,
    })
  const { components } = await ky(url).json()
  if (!Array.isArray(components) || components.length !== 1) {
    throw new Error(
      `Failed to resolve ${component.groupId}:${component.artifactId}`
    )
  }
  return components[0].version
}

export const parseComponentId = (id) => {
  const match = componentIdMatchers.reduce(
    (acc, re) => acc ?? id.match(re),
    null
  )
  if (match == null) {
    throw new Error(`Unexpected component ID format: ${id}`)
  }
  const [, groupId, artifactId, version] = match
  return { groupId, artifactId, version }
}

export const resolveComponentId = async (id) => {
  const component = parseComponentId(id)
  if (component.version != null) {
    return component
  }
  const version = await determineLatestVersion(component)
  return { ...component, version }
}
