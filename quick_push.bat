@echo off
echo Quick Git Update...
git add . && git commit -m "Quick update - %date% %time%" && git push
echo Done!
pause
