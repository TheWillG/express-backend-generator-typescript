const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter, copyFileSync, createNonExistantDirSync } = require('./util');

const createController = (resourceName, resource) => {
  const actions = ['get', 'put', 'post', 'delete'];
  const controllerFolderPath = './generatedApp/src/controllers';
  const files = `${controllerFolderPath}/${resourceName}/index.ts`;
  const renamingFrom = [/MODEL_NAME_CAP/g, /MODELNAME/g];
  const renamingTo = [capFirstLetter(resourceName), resourceName.toLowerCase()];
  const actionsFrom = [];
  const actionsTo = [];
  const exportsFrom = /ACTION_EXPORTS/g;
  let exportsTo = '';
  const resourceActions = resource.actions.map(action => action.toLowerCase());
  actions.forEach((action) => {
    actionsFrom.unshift(new RegExp(`${action.toUpperCase()}_ACTION`, 'g'));
    if (resourceActions.includes(action)) {
      actionsTo.unshift(fs.readFileSync(`./templates/${action}.txt`).toString());
      exportsTo += `  ${action}${capFirstLetter(resourceName)},\n`;
      if (action === 'get') exportsTo += `  ${action}${capFirstLetter(resourceName)}s,\n`;
    } else {
      actionsTo.unshift('');
    }
  });
  try {
    const actionsOptions = { files, from: actionsFrom, to: actionsTo };
    const renamingOptions = { files, from: renamingFrom, to: renamingTo };
    const exportsOptions = { files, from: exportsFrom, to: exportsTo };
    createNonExistantDirSync(`${controllerFolderPath}/${resourceName}`)
    copyFileSync('./templates/controller.txt', files);
    replace.sync(actionsOptions);
    replace.sync(renamingOptions);
    replace.sync(exportsOptions);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createController;
