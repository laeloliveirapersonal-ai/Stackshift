#!/data/data/com.termux/files/usr/bin/bash
# Uso: ./publicar.sh "mensagem do commit"
set -e
git add -A
git commit -m "${1:-atualização}" || echo "nada novo para commitar"
git push
echo "Enviado. Para gerar APK/AAB: GitHub > Actions > Android (APK + AAB) > Run workflow"
