$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
node (Join-Path $ScriptDir "scripts/harness-flow.mjs") @args
exit $LASTEXITCODE
