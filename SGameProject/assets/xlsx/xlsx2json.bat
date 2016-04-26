

@echo off
for /r "./" %%a in (*.xlsx) do call excel2json\excel2json.exe -e %%a -j ../resources/json/%%~na.json -h 1
pause
