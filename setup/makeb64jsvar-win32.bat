SET variable=%1
SET input=%2
SET output=%3
ECHO "Attempting to convert.."
call certutil -encode %input% win32/temp/%variable%.tmp
ECHO "Done. Going to next file.."
