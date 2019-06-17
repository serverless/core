const generateResourceName = (name, resourceGroupId) => {
  const resourceId = Math.random()
    .toString(36)
    .substring(6)

  return `${name}-${resourceGroupId}-${resourceId}`
}

module.exports = generateResourceName
