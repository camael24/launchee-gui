' start.vbs command pwd pid
Set args = Wscript.Arguments
Set objFSO=CreateObject("Scripting.FileSystemObject")

Const SW_NORMAL = 0
strComputer = "."
strCommand = args(0)
Set objWMIService = GetObject("winmgmts:" _
    & "{impersonationLevel=impersonate}!\\" _
    & strComputer & "\root\cimv2")

' Configure the Notepad process to show a window
Set objStartup = objWMIService.Get("Win32_ProcessStartup")
Set objConfig = objStartup.SpawnInstance_
objConfig.ShowWindow = SW_NORMAL

' Create Notepad process
Set objProcess = objWMIService.Get("Win32_Process")
intReturn = objProcess.Create _
    (strCommand, args(1), objConfig, intProcessID)
If intReturn <> 0 Then
    Wscript.Echo "Process could not be created." & _
        vbNewLine & "Command line: " & strCommand & _
        vbNewLine & "Return value: " & intReturn
End If



If args.count > 2 Then
    outFile=args(2)
    Set objFile = objFSO.CreateTextFile(outFile,True)
    objFile.Write intProcessID
    objFile.Close
End If
