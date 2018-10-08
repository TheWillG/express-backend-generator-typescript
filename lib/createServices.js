const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter, copyFileSync, createNonExistantDirSync } = require('./util');


const createServices = (resourceName, resource) => {
  const services = [
    { action: 'get', name: 'fetch' },
    { action: 'put', name: 'update' },
    { action: 'post', name: 'create' },
    { action: 'delete', name: 'remove' },
  ];
  const servicesDir = './generatedApp/src/services';
  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir);
  }
  const serviceFolderPath = `./generatedApp/src/services/${resourceName}`;

  const resourceActions = resource.actions.map(action => action.toLowerCase());
  services.forEach( (service) => {
    if (resourceActions.includes(service.action)) {
      const files = `./generatedApp/src/services/${resourceName}/${service.name}${capFirstLetter(resourceName)}.ts`;
      try {
        const renamingOptions = {
          files,
          from: [/MODEL_NAME_CAP/g],
          to: [capFirstLetter(resourceName)],
        };
        createNonExistantDirSync(serviceFolderPath);
        copyFileSync(`./templates/${service.action}Service.txt`, files);
        replace.sync(renamingOptions);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

module.exports = createServices;
