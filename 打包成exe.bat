@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===================================================
echo      Markdown预览与转换系统 - 打包工具
echo ===================================================
echo.

:: 检查Python环境
echo [1/5] 正在检查Python环境...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python环境，请安装Python 3.7或更高版本。
    echo 您可以从 https://www.python.org/downloads/ 下载并安装Python。
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [信息] 检测到 %PYTHON_VERSION%

:: 检查pip
echo [2/5] 正在检查pip包管理器...
pip --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到pip包管理器。
    pause
    exit /b 1
)

:: 安装必要的依赖
echo [3/5] 正在安装必要的依赖...
echo [信息] 安装项目依赖...
pip install -r requirements.txt

echo [信息] 安装PyInstaller和图标转换工具...
pip install pyinstaller cairosvg pillow

:: 检查Pandoc
echo [4/5] 正在检查Pandoc...
if exist "pandoc\pandoc.exe" (
    echo [信息] 已找到Pandoc: pandoc\pandoc.exe
) else if exist "pandoc\bin\pandoc.exe" (
    echo [信息] 已找到Pandoc: pandoc\bin\pandoc.exe
) else if exist "pandoc.exe" (
    echo [信息] 已找到Pandoc: pandoc.exe
) else (
    echo [警告] 未找到Pandoc。DOCX转换功能可能无法正常工作。
    echo [信息] 您可以从 https://pandoc.org/installing.html 下载Pandoc，
    echo         并将pandoc.exe放在项目根目录或pandoc子目录中。
    echo.
    set /p CONTINUE=是否继续打包过程？(Y/N): 
    if /i "!CONTINUE!" neq "Y" exit /b 1
)

:: 运行打包脚本
echo [5/5] 正在运行打包脚本...
echo [信息] 这可能需要几分钟时间，请耐心等待...
echo.
python build_exe.py

if %errorlevel% neq 0 (
    echo.
    echo [错误] 打包过程失败。请查看上面的错误信息。
    pause
    exit /b 1
)

echo.
echo ===================================================
echo      打包完成！
echo ===================================================
echo.
echo 可执行文件位于 dist 目录中：
echo %cd%\dist\MarkdownStudio.exe
echo.
echo 您可以直接分发这个exe文件，用户无需安装Python即可运行。
echo.

set /p OPEN_FOLDER=是否打开dist文件夹？(Y/N): 
if /i "%OPEN_FOLDER%" == "Y" start explorer "%cd%\dist"

pause
