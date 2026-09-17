Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\PAWIN\.gemini\antigravity\scratch\thai-stock-scanner-pro"
Set objExec = WshShell.Exec("cmd /c netstat -ano | findstr :3300 | findstr LISTENING")
Do While objExec.Status = 0
    WScript.Sleep 200
Loop
If objExec.ExitCode <> 0 Then
    WshShell.Run """C:\Users\PAWIN\AppData\Roaming\Antigravity\bin\agy-node.cmd"" server.js", 0, False
End If
