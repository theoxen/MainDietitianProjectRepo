namespace API.Common;

public enum ResultTypes
{
    Ok,
    NotFound,
    BadRequest,
    Unauthorized,
    InternalServerError
}

public class Result<T>
{
    public T? Data { get; set; }
    public bool IsSuccessful { get; set; }
    public List<ResultError> ResultErrors { get; set; } = new List<ResultError>();
    public ResultTypes ResultType { get; set; }

    public static Result<T> Ok(T data)
    {
        return new Result<T>
        {
            Data = data,
            IsSuccessful = true,
            ResultType = ResultTypes.Ok
        };
    }

    public static Result<T> NotFound()
    {
        return new Result<T>
        {
            IsSuccessful = false,
            ResultType = ResultTypes.NotFound
        };
    }

    public static Result<T> BadRequest(List<ResultError> resultErrors)
    {
        return new Result<T>
        {
            IsSuccessful = false,
            ResultType = ResultTypes.BadRequest,
            ResultErrors = resultErrors
        };
    }

    public static Result<T> Unauthorized()
    {
        return new Result<T>
        {
            IsSuccessful = false,
            ResultType = ResultTypes.Unauthorized
        };
    }

    public static Result<T> InternalServerError()
    {
        return new Result<T>
        {
            IsSuccessful = false,
            ResultType = ResultTypes.InternalServerError
        };
    }
}

public class ResultError
{
    public required string Message { get; set; }
    public required string Identifier { get; set; } // To identify the error
}

