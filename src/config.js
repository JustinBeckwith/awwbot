import nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });
export const token = nconf.get('token');
export const publicKey = nconf.get('publicKey');
export const applicationId = nconf.get('applicationId');
export const testGuildId = nconf.get('testGuildId');
