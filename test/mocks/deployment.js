'use strict'

const generateDeployment = (overrides = {}) => ({
  id: 'Deployments-123',
  comments: 'Test deployment from node script',
  created: '2017-01-01T00:00:00+0000',
  environmentId: 'Environments-123',
  forcePackageDownload: false,
  forcePackageRedeployment: false,
  formValues: {},
  lastModifiedBy: 'email@acme.com',
  lastModifiedOn: '2017-01-01T00:00:00+0000',
  links: {},
  name: 'Deploy to DEV-SERVER',
  projectId: 'Projects-123',
  queueTime: null,
  releaseId: 'Releases-123',
  skipActions: [],
  specificMachineIds: [],
  taskId: 'ServerTasks-123',
  useGuidedFailure: false,
  ...overrides
})

module.exports = { generateDeployment }
