namespace API.Helpers
{
    public class UserHelperFunctions
    {
        public static string GenerateUniqueUserName(string fullName)
        {
            // Generate a unique UserName by removing spaces and appending a GUID (because usernames are unique but fullnames are not) 
            return fullName.Replace(" ", "").ToLower() + "_" + Guid.NewGuid().ToString("N").Substring(0, 8); // The ToString("N") removes the dashes from the GUID and the Substring(0, 8) takes the first 8 characters of the GUID
        }

        public static string TrimFullName(string fullName)
        {
            return fullName.Trim();
        }
    }
}