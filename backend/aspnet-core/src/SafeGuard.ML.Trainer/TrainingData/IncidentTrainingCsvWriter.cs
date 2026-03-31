using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;

namespace SafeGuard.ML.Trainer.TrainingData;

public class IncidentTrainingCsvWriter
{
    public void Write(string outputPath, IReadOnlyList<GeneratedIncidentTrainingRow> rows)
    {
        var directory = Path.GetDirectoryName(outputPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        using var writer = new StreamWriter(outputPath, false, new UTF8Encoding(false));
        writer.WriteLine(
            "id,title,description,location,audio_file,audio_file_name,audio_content_type,image_file,image_file_name,image_content_type,latitude,longitude,case_id,anonymous,detected_objects,occurred_at,reported_at,creation_time,creator_id,last_modification_time,last_modifier_id,is_deleted,deleter_id,deletion_time,concurrency_stamp,label");

        foreach (var row in rows)
        {
            writer.WriteLine(string.Join(",",
                Escape(row.Id),
                Escape(row.Title),
                Escape(row.Description),
                Escape(row.Location),
                Escape(row.AudioFile),
                Escape(row.AudioFileName),
                Escape(row.AudioContentType),
                Escape(row.ImageFile),
                Escape(row.ImageFileName),
                Escape(row.ImageContentType),
                Escape(row.Latitude),
                Escape(row.Longitude),
                Escape(row.CaseId),
                Escape(row.Anonymous),
                Escape(row.DetectedObjects),
                Escape(row.OccurredAt),
                Escape(row.ReportedAt),
                Escape(row.CreationTime),
                Escape(row.CreatorId),
                Escape(row.LastModificationTime),
                Escape(row.LastModifierId),
                Escape(row.IsDeleted),
                Escape(row.DeleterId),
                Escape(row.DeletionTime),
                Escape(row.ConcurrencyStamp),
                Escape(row.Label)));
        }
    }

    private static string Escape(object value)
    {
        var text = value switch
        {
            null => string.Empty,
            DateTime dateTime => dateTime.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
            DateTimeOffset dateTimeOffset => dateTimeOffset.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
            decimal decimalValue => decimalValue.ToString(CultureInfo.InvariantCulture),
            bool boolValue => boolValue ? "true" : "false",
            Guid guidValue => guidValue.ToString(),
            _ => Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty
        };

        if (text.Contains('"'))
        {
            text = text.Replace("\"", "\"\"");
        }

        if (text.Contains(',') || text.Contains('"') || text.Contains('\n') || text.Contains('\r'))
        {
            text = $"\"{text}\"";
        }

        return text;
    }
}
