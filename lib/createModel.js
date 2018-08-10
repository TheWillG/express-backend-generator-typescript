const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter } = require('./util');

const createModel = async (modelName, model) => {
  let modelsDir = './generatedApp/src/models';
  if (!fs.existsSync(modelsDir)){
      fs.mkdirSync(modelsDir);
  }
  const modelFilePath = `./generatedApp/src/models/${modelName}.ts`;
  let variableStringBuilder = '';
  Object.keys(model.variables).forEach((variable, index) => {
    const lineEnding =
      index === Object.keys(model.variables).length - 1 ? ',' : ',\n  ';
    variableStringBuilder += `${variable}: ${
      model.variables[variable]
    }${lineEnding}`;
  });
  try {
    const options = {
      files: modelFilePath,
      from: [/SCHEMA_NAME/g, /MODEL_NAME_CAP/g, /MODEL_VARIABLES/g],
      to: [
        `${modelName}Schema`,
        capFirstLetter(modelName),
        variableStringBuilder,
      ],
    };
    await fs
      .createReadStream('./templates/model.txt')
      .pipe(fs.createWriteStream(modelFilePath, { flag: 'a' }));
    await replace(options);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createModel;