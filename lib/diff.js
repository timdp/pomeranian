import ansiColors from 'ansi-colors'
import diffLines from 'diff-lines'

const colors = {
  '+': ansiColors.green,
  '-': ansiColors.red,
}

const defaultColor = ansiColors.dim

export const diff = (a, b) =>
  diffLines(a, b, { n_surrounding: 3 }).replace(/^(.).*/gm, (line, char) =>
    (colors[char] ?? defaultColor)(line)
  )
