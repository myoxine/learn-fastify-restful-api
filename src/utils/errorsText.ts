import {FastifySchemaValidationError} from "fastify/types/schema"
const errorsText = (errors:FastifySchemaValidationError[],seperator=", "):string => {
    var message="";
    for (const error of errors) {
        if(message!==""){
            message+=seperator;
        }
        message+=error.message;
    }
    return message;
};
  
export default errorsText;
  