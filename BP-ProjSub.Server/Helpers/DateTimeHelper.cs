public static class DateTimeHelper
{
    public static DateTime? ConvertToLocalTime(DateTime? utcDateTime)
    {
        if (!utcDateTime.HasValue)
            return null;
            
        return DateTime.Parse(utcDateTime.Value.ToString()).ToLocalTime();
    }
    
    public static DateTime ConvertToLocalTime(DateTime utcDateTime)
    {
        return DateTime.Parse(utcDateTime.ToString()).ToLocalTime();
    }
    
    public static DateTime ConvertToLocalTimeOrNow(DateTime? utcDateTime)
    {
        if (!utcDateTime.HasValue)
            return DateTime.Now;
            
        return ConvertToLocalTime(utcDateTime.Value);
    }
}