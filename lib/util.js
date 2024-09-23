import { spawn } from 'node:child_process'
import { dirname } from 'node:path'
import { promisify } from 'node:util'

import ansiColors from 'ansi-colors'
import { findUp } from 'find-up'

import { diff } from './diff.js'
import { Emoji } from './emoji.js'
import { readPom, writePom } from './pom.js'
import { confirm } from './ui.js'
import { serializeXml } from './xml.js'

const spawnAsync = promisify(spawn)

export const pomUpdater =
  (performUpdate) =>
    async ({ id, ids, scope, yes, mavenArgs }) => {
      const allIds = [id, ...ids]
      const confirmImpl = yes ? async () => true : confirm

      const pomPath = await findUp('pom.xml')
      if (pomPath == null) {
        throw new Error('No pom.xml found')
      }

      console.info(Emoji.EYES + ' ' + ansiColors.bold('Reading POM: ') + pomPath)
      const originalPom = await readPom(pomPath)
      console.info()

      const updatedPom = originalPom.cloneNode(true)
      await performUpdate(updatedPom, allIds, scope)

      const diffStr = diff(serializeXml(originalPom), serializeXml(updatedPom))
      if (diffStr === '') {
        console.info(Emoji.WARNING + ' ' + ansiColors.bold('No changes'))
        return
      }

      console.info(Emoji.INFO + ' ' + ansiColors.bold('Pending changes:'))
      console.info(diffStr)
      console.info()

      if (!(await confirmImpl('Apply changes?', true))) {
        return
      }
      console.info()

      console.info(
        Emoji.PENCIL + ' ' + ansiColors.bold('Updating POM: ') + pomPath
      )
      await writePom(pomPath, updatedPom)
      console.info()

      if (!(await confirmImpl('Run Maven?', false))) {
        return
      }
      console.info()

      const mavenCommand = 'mvn ' + mavenArgs
      console.info(
        Emoji.COFFEE + ' ' + ansiColors.bold('Running Maven: ') + mavenCommand
      )
      await spawnAsync(mavenCommand, {
        cwd: dirname(pomPath),
        shell: true,
        stdio: 'inherit',
      })
      console.info()
    }
