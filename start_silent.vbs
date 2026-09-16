Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\PAWIN\.gemini\antigravity\scratch\thai-stock-scanner-pro"
WshShell.Run "cmd /c run_all.bat", 0, False
