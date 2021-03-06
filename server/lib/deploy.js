import { deploy as sourceDeploy } from 'auth0-source-control-extension-tools';

import report from './reporter';
import { getExcluded } from './storage';
import config from './config';

const { getChanges } = require(`./providers/${process.env.A0EXT_PROVIDER}`);

export default (storage, client, options) => {
  const { id, sha, user, branch, repository } = options;
  const repo = {
    id,
    sha,
    user,
    branch,
    repository
  };

  options.version = (id === 'manual') ? sha : branch;

  return getChanges(options)
    .then(assets =>
      getExcluded(storage)
        .then((exclude) => {
          assets.exclude = exclude;
          repo.assets = assets;
          return assets;
        }))
    .then(assets => sourceDeploy(assets, client, config))
    .then(progress => report(storage, { repo, progress }))
    .catch(err => report(storage, { repo, error: err.message })
      .then(() => Promise.reject(err)));
};
