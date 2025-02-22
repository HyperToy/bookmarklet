#bin/bash
rm  out/*
cp src/* out
pnpm minimize-js out
for file in out/*; do
    sed -i '' '1s/^/javascript:/' "$file"
done
