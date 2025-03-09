export class ValidationPatterns
{
    static strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/; //The lookaheads (?=...) in a regular expression are used to assert that certain conditions are met somewhere in the string, but they do not consume characters or specify what characters are allowed in the string. If you only use lookaheads without specifying the allowed characters, the regular expression will not match any characters because the lookaheads alone do not define the structure of the string. (the .{8,} defines the allowed characters "."(any) and the length "{8,}" (minimum 8 characters))
    static phoneNumber = /^\d+$/;
    static gender = /^(Male|Female|)$/;
    static dietType = /^(Special Diet|Muscle Gain|Fat Loss|Weight Gain|Weight Loss|)$/;
    static fullName = /^[a-zA-Z ]+$/; // The space is needed so it also accepts spaces instead of only alphabetic letters
    static height = /^\d{2,3}$/;
    static email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    static otp = /^\d{6}$/;

    static floatPattern = /^\d+(\.\d+)?$/;
}