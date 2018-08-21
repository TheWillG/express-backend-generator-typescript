const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter } = require('./util');


const createServices = async (resourceName, resource) => {
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
  services.forEach(async (service) => {
    if (resourceActions.includes(service.action)) {
      const files = `./generatedApp/src/services/${resourceName}/${service.name}${capFirstLetter(resourceName)}.ts`;
      try {
        const renamingOptions = {
          files,
          from: [/MODEL_NAME_CAP/g],
          to: [capFirstLetter(resourceName)],
        };
        if (!fs.existsSync(serviceFolderPath)) {
          fs.mkdirSync(serviceFolderPath);
        }
        await fs
          .createReadStream(`./templates/${service.action}Service.txt`)
          .pipe(fs.createWriteStream(files, { flag: 'w' }));
        await replace(renamingOptions);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

module.exports = createServices;
