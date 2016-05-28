@echo off
title [convert excel to json]
echo press any button to start.
::@pause > nul
echo start converting ....
for /r "../resources/json/" %%a in (*.json) do del %%a
node index.js --export
echo convert over!
@pause