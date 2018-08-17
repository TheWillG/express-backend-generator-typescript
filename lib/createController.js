const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter } = require('./util');

const createController = async (modelName, model) => {
  const controllerFolderPath = './generatedApp/src/controllers';
  const controllerFilePath = `${controllerFolderPath}/${modelName}Controller.ts`;
  try {
    const options = {
      files: controllerFilePath,
      from: [/MODEL_NAME_CAP/g, /MODELNAME/g, /BODY_PARAMS/g],
      to: [
        capFirstLetter(modelName),
        modelName,
        Object.keys(model).join(', '),
      ],
    };
    await fs
      .createReadStream('./templates/controller.txt')
      .pipe(fs.createWriteStream(controllerFilePath, { flag: 'w' }));
    await replace(options);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createController;
