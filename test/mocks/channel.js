'use strict'

const generateChannel = (overrides = {}) => ({
  id: 'Channels-123',
  name: 'My Channel',
  description: null,
  projectId: 'Projects-123',
  lifecycleId: 'Lifecycles-1',
  isDefault: true,
  rules: [
    {
      id: '01ee32d3-0d6d-4af4-aaaa-5d6a3dceebbb',
      versionRange: null,
      tag: '^alpha',
      actionPackages: [
        {
          deploymentAction: 'My Package Step',
          packageReference: ''
        }
      ],
      links: {},
      actions: [
        'My Package Step'
      ]
    }
  ],
  ...overrides
})

const generateSearchChannel = (items = [], overrides = {}) => ({
  itemType: 'Channel',
  totalResults: items.length,
  itemsPerPage: items.length,
  numberOfPages: 1,
  lastPageNumber: 1,
  items,
  ...overrides
})

module.exports = { generateChannel, generateSearchChannel }
