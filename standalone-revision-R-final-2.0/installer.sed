[Version]
Class=IEXPRESS
SEDVersion=3

[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=1
CabinetNameTemplate=Revision-R-Final-2.0.cab
CompressFiles=1
TargetName=dist\standalone-revision-R-final-2.0-installer.exe
FriendlyName=Standalone Revision R Final 2.0
AppLaunched=installer-launch.cmd
PostInstallCmd=<None>
Copyright=Glitch Canvas
SourceFiles=SourceFiles

[SourceFiles]
SourceFiles0=.

[SourceFiles0]
%FILE0%=installer-launch.cmd
%FILE1%=install.ps1
%FILE2%=README.md
%FILE3%=webui\glitch-canvas.html
%FILE4%=webui\glitch-canvas.css

[Strings]
FILE0="glitch-canvas.html"
FILE1="glitch-canvas.css"
FILE2="installer-launch.cmd"
FILE3="install.ps1"
FILE4="README.md"