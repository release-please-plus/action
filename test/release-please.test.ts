/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable node/no-unpublished-import */
import * as action from '../src'
import 'jest-extended'
const core = require('@actions/core')

import { Manifest } from 'release-please-plus/build/src/manifest'
// const { Node } = require('release-please/build/src/strategies/node')
// As defined in action.yml

import { setupServer } from 'msw/node'
import { rest } from 'msw'

const defaultInput = {
  fork: 'false',
  clean: 'true',
  'bump-minor-pre-major': 'false',
  'bump-patch-for-minor-pre-major': 'false',
  path: '',
  'monorepo-tags': 'false',
  'changelog-path': '',
  'changelog-types': '',
  command: '',
  'version-file': '',
  'default-branch': '',
  // eslint-disable-next-line no-template-curly-in-string
  'pull-request-title-pattern': 'chore${scope}: release${component} ${version}',
  draft: 'false',
  'draft-pull-request': 'false'
}

const fixturePrs = [
  {
    headBranchName: 'release-please--branches--main',
    baseBranchName: 'main',
    number: 22,
    title: 'chore(master): release 1.0.0',
    body: ':robot: I have created a release *beep* *boop*',
    labels: ['autorelease: pending'],
    files: []
  },
  {
    headBranchName: 'release-please--branches--main',
    baseBranchName: 'main',
    number: 23,
    title: 'chore(master): release 1.0.0',
    body: ':robot: I have created a release *beep* *boop*',
    labels: ['autorelease: pending'],
    files: []
  }
]

let input
let output

process.env.GITHUB_REPOSITORY = 'google/cloud'

const server = setupServer(
  rest.get('https://api.github.com/repos/google/cloud', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        default_branch: 'main'
      })
    )
  })
)

describe('release-please-plus-action', () => {
  beforeEach(() => {
    input = {}
    output = {}
    core.setOutput = (name, value) => {
      output[name] = value
    }
    core.getInput = name => {
      if (input[name] === undefined || input[name] === null) {
        return defaultInput[name]
      } else {
        return input[name]
      }
    }
    core.getBooleanInput = name => {
      // Float our own helper, for mocking purposes:
      const trueValue = ['true', 'True', 'TRUE']
      const falseValue = ['false', 'False', 'FALSE']
      const val = core.getInput(name)
      if (trueValue.includes(val)) {
        return true
      }
      if (falseValue.includes(val)) {
        return false
      }
      throw new TypeError(
        `Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
          'Support boolean input list: `true | True | TRUE | false | False | FALSE`'
      )
    }
  })
  afterEach(() => {
    jest.restoreAllMocks()
    server.resetHandlers()
  })

  beforeAll(() => server.listen())
  afterAll(() => server.close())

  it('opens PR with custom changelogSections', async () => {
    input = {
      command: 'release-pr',
      'release-type': 'node',
      'changelog-types':
        '[{"type":"feat","section":"Features","hidden":false},{"type":"fix","section":"Bug Fixes","hidden":false},{"type":"chore","section":"Miscellaneous","hidden":false}]',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }

    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockResolvedValue({
        createPullRequests: createPullRequestsFake
      } as any)
    await action.main()

    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createManifestCommand).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      'main',
      expect.objectContaining({
        changelogSections: JSON.parse(
          '[{"type":"feat","section":"Features","hidden":false},{"type":"fix","section":"Bug Fixes","hidden":false},{"type":"chore","section":"Miscellaneous","hidden":false}]'
        )
      }),
      expect.anything()
    )
  })

  it('opens PR with custom title', async () => {
    input = {
      command: 'release-pr',
      'release-type': 'node',
      'pull-request-title-pattern': 'beep boop',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }

    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake
      } as any)
    await action.main()

    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createManifestCommand).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      'main',
      expect.objectContaining({
        pullRequestTitlePattern: 'beep boop'
      }),
      expect.anything()
    )
  })

  it('opens PR with custom header', async () => {
    input = {
      command: 'release-pr',
      'release-type': 'node',
      'pull-request-header': 'another header',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }

    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake
      } as any)
    await action.main()

    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createManifestCommand).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      'main',
      expect.objectContaining({
        pullRequestHeader: 'another header'
      }),
      expect.anything()
    )
  })

  it('both opens PR to the default branch and tags GitHub releases by default', async () => {
    input = {
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }

    const createReleasesFake = jest.fn().mockReturnValue([
      {
        upload_url: 'http://example.com',
        tagName: 'v1.0.0'
      }
    ])
    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake,
        createReleases: createReleasesFake
      } as any)
    await action.main()

    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createReleasesFake).toHaveBeenCalledOnce()
    expect(createManifestCommand).toHaveBeenCalledTimes(2)
    const { prs, ...outputWithoutPrs } = output

    expect(outputWithoutPrs).toStrictEqual({
      release_created: true,
      upload_url: 'http://example.com',
      tag_name: 'v1.0.0',
      pr: fixturePrs[0],
      releases_created: true,
      paths_released: '["."]'
    })
    expect(JSON.parse(prs)).toStrictEqual([fixturePrs[0]])
  })

  it('both opens PR to a different default branch and tags GitHub releases by default', async () => {
    input = {
      'default-branch': 'dev',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }

    const createReleasesFake = jest.fn().mockReturnValue([
      {
        upload_url: 'http://example.com',
        tag_name: 'v1.0.0'
      }
    ])
    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake,
        createReleases: createReleasesFake
      } as any)
    await action.main()

    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createReleasesFake).toHaveBeenCalledOnce()
    expect(createManifestCommand.mock.calls[0][1]).toEqual('dev')
    expect(createManifestCommand.mock.calls[1][1]).toEqual('dev')
    const { prs, ...outputWithoutPrs } = output
    expect(outputWithoutPrs).toStrictEqual({
      release_created: true,
      upload_url: 'http://example.com',
      tag_name: 'v1.0.0',
      pr: fixturePrs[0],
      releases_created: true,
      paths_released: '["."]'
    })
    expect(JSON.parse(prs)).toStrictEqual([fixturePrs[0]])
  })

  it('only opens PR, if command set to release-pr', async () => {
    input = {
      command: 'release-pr',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }

    const createReleasesFake = jest.fn().mockReturnValue([
      {
        upload_url: 'http://example.com',
        tag_name: 'v1.0.0'
      }
    ])
    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake,
        createReleases: createReleasesFake
      } as any)
    await action.main()

    expect(createManifestCommand).toHaveBeenCalledOnce()
    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createReleasesFake).not.toHaveBeenCalledOnce()

    const { prs, ...outputWithoutPrs } = output
    expect(outputWithoutPrs).toStrictEqual({
      pr: fixturePrs[0]
    })
    expect(JSON.parse(prs)).toStrictEqual([fixturePrs[0]])
  })

  it('only creates GitHub release, if command set to github-release', async () => {
    input = {
      command: 'github-release',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }

    const createReleasesFake = jest.fn().mockReturnValue([
      {
        upload_url: 'http://example.com',
        tag_name: 'v1.0.0'
      }
    ])
    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake,
        createReleases: createReleasesFake
      } as any)
    await action.main()
    expect(createManifestCommand).toHaveBeenCalledOnce()
    expect(createPullRequestsFake).not.toHaveBeenCalledOnce()
    expect(createReleasesFake).toHaveBeenCalledOnce()
    expect(output).toStrictEqual({
      release_created: true,
      upload_url: 'http://example.com',
      tag_name: 'v1.0.0',
      releases_created: true,
      paths_released: '["."]'
    })
  })

  it('sets appropriate outputs when GitHub release created', async () => {
    const release = {
      id: 123456,
      name: 'v1.2.3',
      tagName: 'v1.2.3',
      sha: 'abc123',
      notes: 'Some release notes',
      url: 'http://example2.com',
      draft: false,
      uploadUrl: 'http://example.com',
      path: '.',
      version: '1.2.3',
      major: 1,
      minor: 2,
      patch: 3
    }
    input = {
      'release-type': 'node',
      command: 'github-release',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }
    const createReleasesFake = jest.fn().mockReturnValue([release])
    jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createReleases: createReleasesFake
      } as any)
    await action.main()
    expect(output.id).toEqual(123456)
    expect(output.release_created).toBeTrue()
    expect(output.releases_created).toBeTrue()
    expect(output.upload_url).toEqual('http://example.com')
    expect(output.html_url).toEqual('http://example2.com')
    expect(output.tag_name).toEqual('v1.2.3')
    expect(output.major).toEqual(1)
    expect(output.minor).toEqual(2)
    expect(output.patch).toEqual(3)
    expect(output.version).toEqual('1.2.3')
    expect(output.sha).toEqual('abc123')
    expect(output.paths_released).toEqual('["."]')
  })

  it('sets appropriate outputs when release PR opened', async () => {
    input = {
      'release-type': 'node',
      command: 'release-pr',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }
    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake
      } as any)
    await action.main()
    expect(createManifestCommand).toHaveBeenCalledOnce()
    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    const { prs, ...outputWithoutPrs } = output
    expect(outputWithoutPrs).toStrictEqual({
      pr: fixturePrs[0]
    })
    expect(JSON.parse(prs)).toStrictEqual([fixturePrs[0]])
  })

  it('does not set PR output, when no release PR is returned', async () => {
    input = {
      'release-type': 'node',
      command: 'release-pr',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }
    const createPullRequestsFake = jest.fn().mockReturnValue([undefined])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake
      } as any)
    await action.main()
    expect(createManifestCommand).toHaveBeenCalledOnce()
    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(Object.hasOwnProperty.call(output, 'pr')).toBeFalse()
  })

  it('does not set release output, when no release is returned', async () => {
    input = {
      'release-type': 'node',
      command: 'github-release',
      'skip-github-release': 'false',
      prerelease: 'false',
      'include-v-in-tag': 'true',
      'always-link-local': 'true',
      'separate-pull-requests': 'false',
      'skip-labeling': 'false',
      'sequential-calls': 'false'
    }
    const createReleasesFake = jest.fn().mockReturnValue([undefined])
    jest
      .spyOn(Manifest, 'fromConfig')
      .mockClear()
      .mockReturnValue({
        createReleases: createReleasesFake
      } as any)
    await action.main()
    expect(output).toStrictEqual({ paths_released: '[]' })
  })

  it('creates and runs a manifest release', async () => {
    input = { command: 'manifest' }
    const createReleasesFake = jest.fn().mockReturnValue([
      {
        upload_url: 'http://example.com',
        tag_name: 'v1.0.0'
      }
    ])
    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromManifest')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake,
        createReleases: createReleasesFake
      } as any)
    await action.main()

    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createReleasesFake).toHaveBeenCalledOnce()
    expect(createManifestCommand).toHaveBeenCalledWith(
      expect.anything(),
      'main',
      expect.anything(),
      expect.anything(),
      expect.anything()
    )
    const { prs, ...outputWithoutPrs } = output
    expect(outputWithoutPrs).toStrictEqual({
      release_created: true,
      upload_url: 'http://example.com',
      tag_name: 'v1.0.0',
      pr: fixturePrs[0],
      releases_created: true,
      paths_released: '["."]'
    })
    expect(JSON.parse(prs)).toStrictEqual([fixturePrs[0]])
  })

  it('opens PR only for manifest-pr', async () => {
    input = { command: 'manifest-pr' }
    const createPullRequestsFake = jest.fn().mockReturnValue([fixturePrs[0]])
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromManifest')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake
      } as any)
    await action.main()

    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createManifestCommand.mock.calls[0][1]).toEqual('main')

    expect(createManifestCommand).toHaveBeenCalledWith(
      expect.anything(),
      'main',
      expect.anything(),
      expect.anything(),
      expect.anything()
    )
    const { prs, ...outputWithoutPrs } = output
    expect(outputWithoutPrs).toStrictEqual({
      pr: fixturePrs[0]
    })
    expect(JSON.parse(prs)).toStrictEqual([fixturePrs[0]])
  })

  it('sets appropriate output if multiple releases and prs created', async () => {
    input = { command: 'manifest' }
    const createReleasesFake = jest.fn().mockReturnValue([
      {
        upload_url: 'http://example.com',
        tag_name: 'v1.0.0',
        path: 'a'
      },
      {
        upload_url: 'http://example2.com',
        tag_name: 'v1.2.0',
        path: 'b'
      }
    ])
    const createPullRequestsFake = jest.fn().mockReturnValue(fixturePrs)
    const createManifestCommand = jest
      .spyOn(Manifest, 'fromManifest')
      .mockClear()
      .mockReturnValue({
        createPullRequests: createPullRequestsFake,
        createReleases: createReleasesFake
      } as any)
    await action.main()
    expect(createPullRequestsFake).toHaveBeenCalledOnce()
    expect(createReleasesFake).toHaveBeenCalledOnce()
    expect(createManifestCommand).toHaveBeenCalledWith(
      expect.anything(),
      'main',
      expect.anything(),
      expect.anything(),
      expect.anything()
    )
    const { prs, ...outputWithoutPrs } = output
    expect(outputWithoutPrs).toStrictEqual({
      pr: fixturePrs[0],
      releases_created: true,
      'a--release_created': true,
      'a--upload_url': 'http://example.com',
      'a--tag_name': 'v1.0.0',
      'a--path': 'a',
      'b--release_created': true,
      'b--upload_url': 'http://example2.com',
      'b--tag_name': 'v1.2.0',
      'b--path': 'b',
      paths_released: '["a","b"]'
    })
    expect(JSON.parse(prs)).toStrictEqual(fixturePrs)
  })
})
