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
    }

    public static class DietTypes
    {   
        private const string Base= BaseUrl+"diet-types";
        public const string GetAllDietTypes=Base;
    }
}
