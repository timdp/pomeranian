import ky from 'ky'

const componentIdMatchers = [
  /^(?:https?:)?\/\/[^/]+\/artifact\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/,
  /^([A-Za-z0-9-.]+):([A-Za-z0-9-.]+)(?::([^:]+))?$/,
  /^([A-Za-z0-9-.*]+):([A-Za-z0-9-.*]+)$/,
]

export const parseComponentId = (id) => {
  const match = componentIdMatchers.reduce(
    (acc, re) => acc ?? id.match(re),
    null
  )
  if (match == null) {
    return null
  }
  const [, groupId, artifactId, version] = match
  return { groupId, artifactId, version }
}

export const getLatestComponentVersion = async (groupId, artifactId) => {
  const { components } = await ky
    .get(
      'https://central.sonatype.com/api/internal/browse/component/versions',
      {
        searchParams: {
          filter: `namespace:${groupId},name:${artifactId}`,
          sortField: 'normalizedVersion',
          sortDirection: 'desc',
          size: '1',
          page: '0',
        },
      }
    )
    .json()
  if (!Array.isArray(components) || components.length !== 1) {
    throw new Error(`Failed to resolve ${groupId}:${artifactId}`)
  }
  return components[0].version
}

export const performComponentSearch = async (searchTerm) => {
  const { components } = await ky
    .post('https://central.sonatype.com/api/internal/browse/components', {
      json: {
        searchTerm,
        filter: [],
        size: 10,
        page: 0,
      },
    })
    .json()
  return components.map(({ namespace, name, latestVersionInfo }) => ({
    groupId: namespace,
    artifactId: name,
    version: latestVersionInfo?.version,
  }))
}
