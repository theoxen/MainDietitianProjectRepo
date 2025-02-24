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
        public const string ViewProfile = Base + "/view-profile";
    }

    public static class DietTypes
    {   
        private const string Base= BaseUrl+"diet-types";
        public const string GetAllDietTypes=Base;
    }

    public static class Notes
    {
        private const string Base = BaseUrl + "notes";
        public const string Create = Base + "/create";
    }
}
