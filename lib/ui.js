import enquirer from 'enquirer'

export const confirm = async (message, initial = false) => {
  const prompt = new enquirer.Confirm({
    name: 'question',
    message,
    initial,
  })
  return await prompt.run()
}

// Assumes choices are { name, value } objects
export const select = async (message, choices) => {
  const prompt = new enquirer.Select({
    name: 'select',
    message,
    choices,
  })
  // XXX Enquirer claims to return .value but we get .name instead.
  // However, it also extends the objects (yikes) so let's inspect those.
  const choice = await prompt.run()
  const enabledChoice = choices.find((c) => c.enabled)
  if (enabledChoice == null || enabledChoice.name !== choice) {
    throw new Error('Enquirer API error')
  }
  return enabledChoice.value
}
