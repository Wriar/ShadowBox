#!/bin/bash

echo "ShadowBox Sample Certificate Generation Utility"
echo "----------------------------------------------"
echo "This utility will generate a CA certificate and a localhost certificate for use with ShadowBox."
echo "After the creation, store the CA certificate in the Trusted Root Certification Authorities store."
echo "Then, use the localhost certificate in the /certs file as 'cert.crt' (the certificates) and 'key.key' (the decrypted key)."
echo "----------------------------------------------"
echo ""
echo "Checking for OpenSSL installation..."
if command -v openssl &> /dev/null; then
    echo "OpenSSL is installed."
else
    echo "OpenSSL is not installed."
    exit 1
fi

# Prompt for CA parameters
read -p "Enter the validity period for the CA certificate in days (e.g., 3650): " caDays

# mkdir "CA" without printing the directory listing to console
mkdir CA > /dev/null

# Generate CA key and certificate
openssl genrsa -out CA.key -des3 2048
openssl req -x509 -sha256 -new -nodes -days "$caDays" -key CA.key -out CA.pem

# Create directory for localhost certificates
cd ..
mkdir localhost
cd localhost

# Create the localhost.ext file
cat << EOF > localhost.ext
authorityKeyIdentifier = keyid,issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
EOF

# Prompt for localhost parameters
read -p "Enter the validity period for the localhost certificate in days (e.g., 365): " localhostDays

# Generate localhost key and certificate signing request
openssl genrsa -out localhost.key -des3 2048
openssl req -new -key localhost.key -out localhost.csr

# Generate localhost certificate using the CA
openssl x509 -req -in localhost.csr -CA ../CA/CA.pem -CAkey ../CA/CA.key -CAcreateserial -days "$localhostDays" -sha256 -extfile localhost.ext -out localhost.crt

# Decrypt the localhost key
openssl rsa -in localhost.key -out localhost.decrypted.key

# Write in green
echo "----------------------------------------------" | tput setaf 2
echo "The certificates have been generated for https://localhost at IP 127.0.0.1." | tput setaf 2
echo "Store the CA certificate in the Trusted Root Certification Authorities store." | tput setaf 2
echo "Then, use the localhost certificate in the /certs file as 'cert.crt' (the certificates) and 'key.key' (the decrypted key)." | tput setaf 2
echo "----------------------------------------------" | tput setaf 2
