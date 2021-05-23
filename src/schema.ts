const {
  JsonSchemaManager,
  JsonSchema7Strategy,
  OpenApi3Strategy,
} = require('@alt3/sequelize-to-json-schemas');
const schemaManager = new JsonSchemaManager();
export const sequelizeToSchema = (model: any) => {
  return schemaManager.generate(model, new JsonSchema7Strategy(), {
    exclude: ['id'],
  });
};
