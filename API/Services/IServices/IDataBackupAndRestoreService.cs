namespace API.Services.IServices
{
    public interface IDataBackupAndRestoreService
    {
        public Task<(string fileName, string jsonData)> BackupDataAsync();
        public Task RestoreDataAsync(string jsonData);
    }
}