#!/bin/bash

# made by namar0x0309 with ❤️ at GoAIX
# Wekan Token Generator - Cross-platform version
# Works on Linux, macOS, and Windows (WSL/Git Bash)

echo "=== Wekan Token Generator ==="
echo "made by namar0x0309 with ❤️ at GoAIX"

# Function to check if required tools are available
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        echo "Error: curl is required but not found."
        echo "Please install curl and try again."
        exit 1
    fi
}

# Function to extract JSON values using sed (fallback if jq not available)
extract_json_value() {
    local json="$1"
    local key="$2"
    # Extract value for key from JSON string
    echo "$json" | sed -n "s/.*\"$key\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -1
}

# Function to extract numeric values
extract_json_number() {
    local json="$1"
    local key="$2"
    # Extract numeric value for key from JSON string
    echo "$json" | sed -n "s/.*\"$key\"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p" | head -1
}

# Check dependencies
check_dependencies

# Ask for endpoint (default if blank)
read -p "Enter Wekan endpoint (default: https://wekan.namar0x0309.com): " Endpoint
if [ -z "$Endpoint" ]; then
    Endpoint="https://wekan.namar0x0309.com"
fi

# Ask for username
read -p "Enter username: " Username
if [ -z "$Username" ]; then
    echo "Error: Username is required."
    exit 1
fi

# Secure password input
read -s -p "Enter password: " Password
echo
if [ -z "$Password" ]; then
    echo "Error: Password is required."
    exit 1
fi

echo
echo "Authenticating with Wekan..."

# Build JSON payload manually (avoiding jq dependency)
Body="{\"username\":\"$Username\",\"password\":\"$Password\"}"

# Make request using curl
Response=$(curl -s -X POST "$Endpoint/users/login" \
    -H "Content-Type: application/json" \
    -d "$Body")

# Check if curl succeeded
if [ $? -ne 0 ] || [ -z "$Response" ]; then
    echo "Error: Failed to connect to Wekan endpoint."
    echo "Please check your network connection and endpoint URL."
    exit 1
fi

# Check if response contains error
if echo "$Response" | grep -q '"error"'; then
    echo "Error: Authentication failed."
    echo "Response: $Response"
    exit 1
fi

# Extract token and other values using sed
Token=$(extract_json_value "$Response" "token")
UserId=$(extract_json_value "$Response" "id")
TokenExpires=$(extract_json_value "$Response" "tokenExpires")

# Check if we got a token
if [ -z "$Token" ]; then
    echo "Error: Login failed or no token returned."
    echo "Response: $Response"
    exit 1
fi

# Write .env file
cat > .env << EOF
# Wekan MCP Server Configuration
WEKAN_BASE_URL=$Endpoint
WEKAN_API_TOKEN=$Token
WEKAN_USER_ID=$UserId
WEKAN_TOKEN_EXPIRES=$TokenExpires
EOF

# Update mcp-inspector-config.json if it exists
if [ -f "mcp-inspector-config.json" ]; then
    # Use sed to update WEKAN_BASE_URL in both entries
    # Update wekan-username entry
    sed -i.bak 's|"WEKAN_BASE_URL": "[^"]*"|"WEKAN_BASE_URL": "'"$Endpoint"'"|g' mcp-inspector-config.json
    
    # Clean up backup files
    rm -f mcp-inspector-config.json.bak
    
    echo "✅ Updated WEKAN_BASE_URL in mcp-inspector-config.json"
fi

echo
echo "✅ Authentication successful!"
echo "Token saved to .env"
if [ -n "$TokenExpires" ]; then
    echo "Token expires: $TokenExpires"
fi
