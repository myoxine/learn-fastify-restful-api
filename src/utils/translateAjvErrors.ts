import localize from "ajv-i18n";
import {FastifySchemaValidationError} from "fastify/types/schema"
function translateAjvErrors(language:string, errors:FastifySchemaValidationError[]) {
  switch (language) {
    case "id":
      localize.id(errors); 
      break;
    default:
      localize.en(errors);
  }
}
export default translateAjvErrors;