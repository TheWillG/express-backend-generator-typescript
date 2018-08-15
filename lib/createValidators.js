const fs = require("fs");
const replace = require("replace-in-file");
const { capFirstLetter } = require("./util");

const getJoiDataType = inputType => {
  let type;
  if (inputType.toLowerCase() === "string") {
    type = "string";
  } else if (inputType.toLowerCase() === "number") {
    type = "number";
  } else if (inputType.toLowerCase() === "boolean") {
    type = "boolean";
  } else if (inputType.toLowerCase() === "buffer") {
    type = "binary";
  } else if (inputType.toLowerCase() === "date") {
    type = "date";
  } else if (inputType.toLowerCase() === "objectid") {
    type = "string";
  } else if (inputType.toLowerCase() === "array") {
    type = "array";
  } else {
    type = "String";
  }
  return type;
};

const createValidators = async (modelName, model) => {
  let validatorsDir = "./generatedApp/src/controllers/validators";
  if (!fs.existsSync(validatorsDir)) {
    fs.mkdirSync(validatorsDir);
  }
  const validatorFolderPath = `./generatedApp/src/controllers/validators/${modelName}`;
  const validatorFilePath = `./generatedApp/src/controllers/validators/${modelName}/index.ts`;
  let bodyQueryParamsStringBuilder = "";
  const modelVariables = Object.keys(model.variables);
  modelVariables.forEach((variable, index) => {
    const joiDataType = getJoiDataType(model.variables[variable]);
    const lineEnding = index === modelVariables.length - 1 ? "," : ",\n    ";
    bodyQueryParamsStringBuilder += `${variable}: Joi.${joiDataType}()${lineEnding}`;
  });
  try {
    const options = {
      files: validatorFilePath,
      from: [/BODY_PARAMS/g, /QUERY_PARAMS/g, /MODEL_NAME_CAP/g],
      to: [bodyQueryParamsStringBuilder, bodyQueryParamsStringBuilder, capFirstLetter(modelName)]
    };
    if (!fs.existsSync(validatorFolderPath)) {
      fs.mkdirSync(validatorFolderPath);
    }
    await fs
      .createReadStream("./templates/validator.txt")
      .pipe(fs.createWriteStream(validatorFilePath, { flag: "w" }));
    await replace(options);
  } catch (e) {
    console.error(e);
  }
};

module.exports = createValidators;
