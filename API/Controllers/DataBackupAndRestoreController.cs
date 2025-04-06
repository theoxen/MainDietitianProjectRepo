using System.Text;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class DataBackupAndRestoreController : BaseApiController
    {
        private readonly IDataBackupAndRestoreService _dataBackupAndRestoreService;

        public DataBackupAndRestoreController(IDataBackupAndRestoreService dataBackupAndRestoreService)
        {
            _dataBackupAndRestoreService = dataBackupAndRestoreService;
        }

        [Authorize(Roles = "admin")]
        [HttpPost(Endpoints.BackupAndRestore.CreateDataBackup)]
        public async Task<IActionResult> BackupDatabase()
        {
            try
            {
                var (fileName, jsonData) = await _dataBackupAndRestoreService.BackupDataAsync();

                // Convert the JSON string to bytes
                byte[] fileBytes = System.Text.Encoding.UTF8.GetBytes(jsonData);

                // Return as a downloadable file
                return File(fileBytes, "application/json", fileName);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Failed to create database backup" });
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPost(Endpoints.BackupAndRestore.RestoreData)]
        public async Task<IActionResult> RestoreDatabase([FromForm] IFormFile backupFile)
        {
            try
            {
                if (backupFile == null || backupFile.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }

                using (var stream = new MemoryStream())
                {
                    await backupFile.CopyToAsync(stream);
                    string jsonData = Encoding.UTF8.GetString(stream.ToArray());

                    // Call the restore service to restore the database
                    await _dataBackupAndRestoreService.RestoreDataAsync(jsonData);

                    return Ok(new { message = "Database restored successfully." });
                }
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Failed to restore database" });
            }
        }
    }
}