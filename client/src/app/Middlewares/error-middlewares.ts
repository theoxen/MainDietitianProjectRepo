import { HttpInterceptorFn } from "@angular/common/http";
import { catchError } from "rxjs";
import { HttpError, HttpResponseError } from "../models/http-error";

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        catchError((err) => {
            const errors: any[] = err.error;
            const responseError: HttpResponseError = {
                statusCode: err.status,
                errors: []
            };

            try {
                if (errors instanceof Array) {
                    errors.forEach((error: any) => {
                        const httpError: HttpError = {
                            identifier: error.identifier,
                            message: error.message
                        };

                        responseError.errors.push(httpError);
                    });
                }
            } catch (e) {}

            throw responseError;
        })
    );
}