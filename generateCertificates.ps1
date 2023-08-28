Write-Host "ShadowBox Sample Certificate Generation Utility"
Write-Host "----------------------------------------------"
Write-Host "This utility will generate a CA certificate and a localhost certificate for use with ShadowBox."
Write-Host "After the creation, store the CA certificate in the Trusted Root Certification Authorities store."
Write-Host "Then, use the localhost certificate in the /certs file as 'cert.crt' (the certificates) and 'key.key' (the decrypted key)."
Write-Host "----------------------------------------------"
Write-Host ""
write-Host "Checking for OpenSSL installation..."
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    Write-Host "OpenSSL is installed."
} else {
    Write-Host "OpenSSL is not installed."
}


# Prompt for CA parameters
$caDays = Read-Host "Enter the validity period for the CA certificate in days (e.g., 3650):"

# mkdir "CA" without printing the directory listing to console
mkdir CA | Out-Null

# Generate CA key and certificate
openssl genrsa -out CA.key -des3 2048
openssl req -x509 -sha256 -new -nodes -days $caDays -key CA.key -out CA.pem

# Create directory for localhost certificates
cd ..
mkdir localhost
cd localhost


# Create the localhost.ext file
@"
authorityKeyIdentifier = keyid,issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
"@ | Out-File -Encoding ASCII localhost.ext

# Prompt for localhost parameters
$localhostDays = Read-Host "Enter the validity period for the localhost certificate in days (e.g., 365):"

# Generate localhost key and certificate signing request
openssl genrsa -out localhost.key -des3 2048
openssl req -new -key localhost.key -out localhost.csr

# Generate localhost certificate using the CA
openssl x509 -req -in localhost.csr -CA ../CA/CA.pem -CAkey ../CA/CA.key -CAcreateserial -days $localhostDays -sha256 -extfile localhost.ext -out localhost.crt

# Decrypt the localhost key
openssl rsa -in localhost.key -out localhost.decrypted.key

# Write in green
Write-Host "----------------------------------------------" -ForegroundColor Green
Write-Host "The certificates have been generated for https://localhost at IP 127.0.0.1." -ForegroundColor Green
Write-Host "Store the CA certificate in the Trusted Root Certification Authorities store." -ForegroundColor Green
Write-Host "Then, use the localhost certificate in the /certs file as 'cert.crt' (the certificates) and 'key.key' (the decrypted key)." -ForegroundColor Green
Write-Host "----------------------------------------------" -ForegroundColor Green

