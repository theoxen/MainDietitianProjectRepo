export interface HttpError {
    identifier: string;
    message: string;
};

export interface HttpResponseError {
    errors: HttpError[];
    statusCode: number;
}