#!/bin/bash

# Build documentation script

echo "Building documentation..."

# Clean docs directory
rm -rf docs
mkdir -p docs

# Generate TypeDoc documentation
npx typedoc --out docs src/index.ts

# Copy additional files
echo "Copying additional documentation files..."
cp llm.txt docs/
cp docs-src/llm-guide.html docs/
cp docs-src/custom.css docs/

# Add custom CSS link to TypeDoc pages
echo "Adding custom CSS to documentation..."
find docs -name "*.html" -type f | while read file; do
  if ! grep -q "custom.css" "$file"; then
    sed -i '' 's|</head>|<link rel="stylesheet" href="custom.css"></head>|' "$file" 2>/dev/null || \
    sed -i 's|</head>|<link rel="stylesheet" href="custom.css"></head>|' "$file"
  fi
done

# Create index redirect if needed
if [ ! -f "docs/index.html" ]; then
  echo "Creating index.html redirect..."
  cat > docs/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=modules.html">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="modules.html">API documentation</a>...</p>
</body>
</html>
EOF
fi

echo "Documentation build complete!"