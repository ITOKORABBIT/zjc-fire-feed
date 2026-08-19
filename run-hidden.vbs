' 靜音執行 run.cmd，避免每 10 分鐘閃一個黑色命令視窗。
CreateObject("WScript.Shell").Run "cmd /c ""E:\00. PROJECT\zjc-fire-feed\run.cmd""", 0, False
