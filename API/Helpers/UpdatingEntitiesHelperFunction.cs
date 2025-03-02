namespace API.Helpers
{
    public class UpdatingEntitiesHelperFunction
    {
        public static bool ChangeInFieldsDetected<T, Z>(T entity, Z updatedEntity)
        {

            if (entity == null || updatedEntity == null)
                return true; // Consider changes detected if one of them is null

            // Get common properties (fields with the same name)
            var commonProperties = typeof(T).GetProperties()
                .Where(p => typeof(Z).GetProperty(p.Name) != null);

            foreach (var property in commonProperties)
            {
                var updatedProperty = typeof(Z).GetProperty(property.Name);

                if (updatedProperty != null)
                {
                    var originalValue = property.GetValue(entity);
                    var updatedValue = updatedProperty.GetValue(updatedEntity);

                    // If values are different, changes are detected
                    if (!Equals(originalValue, updatedValue))
                        return true;
                }
            }

            return false; // No changes detected
        }
    }
}