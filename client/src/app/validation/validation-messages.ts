export class ValidationMessages
{
    static required="*Is required";

    static strongPassword = "*Password must be at least 6 characters, contain an uppercase, a lowercase, a number, and a special character";
    static unauthorized="*Wrong credentials";
    static fullName="*Full name must contain only letters";
    static phoneNumber="*Phone number must be a number";
    static height="*Height (in cm) must be a 2-3 digit number";
    static dateOfBirth="*Date of birth must be in the past";
    static gender="*Gender must be 'Male' or 'Female'";
    static dietType="*Diet type must be 'Special Diet', 'Muscle Gain', 'Fat Loss', 'Weight Gain', or 'Weight Loss'";
    static email="*Email must be a valid email address (x@x.x)";
    static emailExists="*Email already exists";
    static emailDoesNotExist="*Email does not exist";
    static phoneNumberExists="*Phone number already exists";
    static otp="*OTP must be a 6 digit number";
    static invalidOtp="*Invalid OTP";
    static otpNotRequested="*OTP not requested";
}