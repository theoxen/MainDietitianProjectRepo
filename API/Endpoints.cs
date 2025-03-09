using System;

namespace API;

public static class Endpoints
{
    const string BaseUrl = "api/";

    public static class Users
    {
        public const string Base = BaseUrl + "users";
        public const string RegisterUser = Base + "/register";
        public const string LoginUser = Base + "/login";
        public const string SendOtp = Base + "/send-otp";
        public const string VerifyOtp = Base + "/verify-otp";
        public const string ChangePassword = Base + "/change-password";
        public const string ViewProfile = Base + "/view-profile/{id}";
        public const string DeleteUser = Base + "/{id}";
        public const string GetNoteByUserId = Base + "/{userId}/note"; 
        public const string UpdateProfile = Base;
        public const string GetUserIdByPhoneNumber = Base + "/{phoneNumber}/get-user-id";
        
    }

    public static class DietTypes
    {   
        private const string Base= BaseUrl+"diet-types";
        public const string GetAllDietTypes=Base;
    }

    public static class Advice
    {
        private const string Base = BaseUrl + "advice";
        public const string Create = Base;
        public const string Delete = Base + "/{adviceId}"; // the {adviceId} must be the same name as the parameter in the controller method
        public const string GetAdvice = Base + "/{adviceId}"; // the {adviceId} must be the same name as the parameter in the controller method
        public const string UpdateAdvice = Base;
        public const string GetAll = Base;
        public const string Search = Base + "/search";
    }

    public static class Reviews
    {
        private const string Base = BaseUrl + "reviews";
        public const string Create = Base;
        public const string UpdateReview = Base;
        public const string Delete = Base + "/{reviewId}";
        public const string GetReview = Base + "/{reviewId}";
        public const string Search = Base + "/search";
        public const string GetAll = Base;
    }

    public static class Notes
    {
        private const string Base = BaseUrl + "notes";
        public const string Create = Base ;
        public const string Delete = Base + "/{noteId}"; // the {noteId} must be the same name as the parameter in the controller method
        public const string GetNote = Base + "/{noteId}"; // the {noteId} must be the same name as the parameter in the controller method
        public const string UpdateNote = Base;
    }

    public static class Metrics
    {
        private const string Base = BaseUrl + "metrics";
        public const string Add = Base ;
        public const string Delete = Base + "/{metricsId}"; 
        public const string ViewMetrics = Base + "/{metricsId}"; 
        public const string EditMetrics = Base;
        public const string SearchMetrics = Base + "/search";

    }

    public static class Recipes
    {
        private const string Base = BaseUrl + "recipes";
        public const string Upload = Base;
        public const string View = Base + "/{id}"; 
        public const string ViewAll = Base; 
        
        public const string Edit = Base + "/{id}"; 
        public const string Search = Base + "/search"; 
        public const string Delete = Base + "/{id}"; 
    }

     public static class Diets
    {
        private const string Base = BaseUrl + "diets";
        public const string Create = Base;
        public const string Delete = Base + "/{dietId}";
        public const string GetDiet = Base + "/{dietId}";
        public const string UpdateDiet = Base;
    }
}
