@echo off
echo Ejecutando test fresh-order-entry.spec.ts con navegador visible...
npx playwright test tests/fresh-order-entry.spec.ts --project=beta --headed --slowMo=1000
pause