namespace API.Data;

public class DietType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public DietType(string name)
    {
        Name = name;
    }
}
