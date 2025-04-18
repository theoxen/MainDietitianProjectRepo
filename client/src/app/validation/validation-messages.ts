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
    static passwordMismatch="*Passwords do not match";
    static emailOrOtpMissing="*Email or OTP is missing, please head to the previous page and re-enter your Email and OTP"
    static bodyweight = "*Bodyweight must be a number";
    static fatmass = "*Fat Mass (in %) must be a number";
    static musclemass = "*Muscle Mass must be a number";
    static fatMassMaxValue = "*Fat Mass shouldn't be greater than 100%";
    static fatMassMinValue = "*Fat Mass shouldn't be less than 2%";
    static maxTwoDecimalPlacesFatMass = "*Fat Mass must not have more than 2 decimal places";
    static maxTwoDecimalPlacesBodyWeight = "*Body Weight must not have more than 2 decimal places";
    static maxTwoDecimalPlacesMuscleMass= "*Muscle Mass must not have more than 2 decimal places";
    static ReviewMinValue="*Value must be at least 1";
    static ReviewMaxValue="*Value must be at most 5";


    static recipeName="*Name must contain only letters";
    static recipeDescription="*Description must contain only letters";
    static recipeIngredients="*Ingredients must contain only letters";
    static recipeProtein="*Protein must be a number";
    static recipeCarbs="*Carbs must be a number";
    static recipeFats="*Fats must be a number";
    static recipeCalories="*Calories must be a number";


}