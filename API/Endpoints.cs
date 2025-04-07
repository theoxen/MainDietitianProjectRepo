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
        public const string UpdateProfile = Base;
        public const string GetUserIdByPhoneNumber = Base + "/{phoneNumber}/get-user-id";
        public const string GetAllClients = Base + "/all-clients";
        public const string GetAllClientsWithId = Base + "/all-clients-withid";

        public const string GetNoteByUserId = Base + "/{userId}/note"; 
        
        public const string GetReviewByUserId = Base + "/{userId}/review";
        
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
        public const string UpdateAdvice = Base + "/{adviceId}";
        public const string GetAll = Base + "/view";
        public const string Search = Base + "/search";
    }

    public static class Reviews
    {
        private const string Base = BaseUrl + "reviews";
        public const string Create = Base;
        public const string UpdateReview = Base + "/{reviewId}";
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


  public static class Appointments
    {
        private const string Base = BaseUrl + "appointments";
        public const string Make = Base ;
        public const string View = Base + "/{appointmentId}"; 
        public const string ViewAll = Base; 
        
        public const string Edit = Base; 
        public const string Search = Base + "/search"; 
        public const string Cancel = Base + "/{appointmentId}"; 
    }

     public static class Diets
    {
        private const string Base = BaseUrl + "diets";
        public const string Create = Base;
        public const string Update = Base;
        public const string GetDiet = Base + "/{id}";
        public const string GetAll = Base;
        public const string Delete = Base + "/{id}";
        public const string GetDietByClientId = Base + "/{clientId}/theclient";
        public const string GetDietIdByClientId = Base + "/client/{userId}";
        public const string SearchDiets = Base + "/search";

    }

    public static class BackupAndRestore
    {
        public const string CreateDataBackup = BaseUrl + "backup";
        public const string RestoreData = BaseUrl + "restore";
    }

    public static class Articles
    {
        private const string Base = BaseUrl + "articles";
        public const string Create = Base;
        public const string Update = Base;
        public const string Delete = Base + "/{id}";
        public const string GetById = Base + "/{id}";
        public const string GetAll = Base; 
        public const string Search = Base + "/search/{searchTerm}";
    }
}
