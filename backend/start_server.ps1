$process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "dev" -WorkingDirectory "d:\ticketing\backend" -PassThru -NoNewWindow -RedirectStandardOutput "d:\ticketing\backend\server.log" -RedirectStandardError "d:\ticketing\backend\server_error.log"
Write-Output $process.Id > "d:\ticketing\backend\server_pid.txt"
