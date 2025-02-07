import { ValidationErrors } from "@angular/forms";

export class Validator
{
    static getValidationError(errors:ValidationErrors | null,errorMessages:Map<string,string>) : string
    {
        if(!errors)
        {
            return ""
        }
        
        const errorTypes=Object.keys(errors);

        if(errorTypes.length == 0)
        {
            return ""
        }

        return errorMessages.get(errorTypes[0]) ?? ""
    }
}