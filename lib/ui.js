import enquirer from 'enquirer'

export const confirm = async (message, initial = false) => {
  const prompt = new enquirer.Confirm({
    name: 'question',
    message,
    initial,
  })
  return await prompt.run()
}
