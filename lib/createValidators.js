const fs = require('fs');
const replace = require('replace-in-file');
const { capFirstLetter } = require('./util');

const createValidators = async (modelName, model) => {
  let validatorsDir = './generatedApp/src/controllers/validators';
  if (!fs.existsSync(validatorsDir)){
      fs.mkdirSync(validatorsDir);
  }
  const validatorFolderPath = `./generatedApp/src/controllers/validators/${modelName}`;
  const validatorFilePath = `./generatedApp/src/controllers/validators/${modelName}/index.ts`;
  let bodyQueryParamsStringBuilder = '';
  Object.keys(model.variables).forEach((variable, index) => {
    const lineEnding =
      index === Object.keys(model.variables).length - 1 ? ',' : ',\n    ';
    bodyQueryParamsStringBuilder += `${variable}: Joi.${String(model.variables[variable]).toLocaleLowerCase()}()${lineEnding}`;
  });
  try {
    const options = {
      files: validatorFilePath,
      from: [/BODY_PARAMS/g, /QUERY_PARAMS/g, /MODEL_NAME_CAP/g],
      to: [
        bodyQueryParamsStringBuilder,
        bodyQueryParamsStringBuilder,
        capFirstLetter(modelName),
      ],
    };
    if (!fs.existsSync(validatorFolderPath)) {
      fs.mkdirSync(validatorFolderPath);
    }
    await fs
      .createReadStream('./templates/validator.txt')
      .pipe(fs.createWriteStream(validatorFilePath, { flag: 'w' }));
    await replace(options);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createValidators;