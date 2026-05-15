# ☁️ Amazon EC2 Deployment Guide (with Automatic HTTPS via Caddy)

Migrating to Amazon EC2 provides a robust, native Linux environment (ext4/XFS) that eliminates the NTFS filesystem errors you experienced locally. 

This guide covers deploying your NodeBB project on an EC2 instance, utilizing **Caddy** to automatically handle SSL/HTTPS certificates and reverse proxy traffic.

---

## 🏗️ 1. EC2 Instance Setup

### Launching the Instance
1. **OS**: Choose **Ubuntu 24.04 LTS** (or 22.04).
2. **Size**: `t3.small` or larger is recommended for NodeBB + MongoDB.
3. **Storage**: At least 20GB gp3 (ext4 is used by default).

### Configure the Security Group
You must open the following inbound ports in your EC2 Security Group:
- **Port 22 (SSH)**: To access your server.
- **Port 80 (HTTP)**: Required for Caddy's Let's Encrypt validation.
- **Port 443 (HTTPS)**: For secure web traffic.

---

## 🌐 2. Domain & DNS Configuration

To get automatic HTTPS, you need a domain name pointing to your EC2 instance.
1. In your AWS Console, assign an **Elastic IP** to your EC2 instance (so the IP doesn't change on reboot).
2. Go to your Domain Registrar (e.g., Route53, Namecheap, Cloudflare).
3. Create an **A Record**:
   - **Host**: `@` (or a subdomain like `forum`)
   - **Value**: Your EC2 Elastic IP address.

> [!IMPORTANT]  
> Wait a few minutes for DNS to propagate before starting the services, or Caddy's SSL generation will fail.

---

## ⚙️ 3. Server Preparation

SSH into your EC2 instance and run the following commands to install Docker and clone your project:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Git and clone your repository
sudo apt install -y git
git clone https://github.com/duongbhl/FUST.git -b hai_nodebb
cd FUST/
```

*(Note: Replace the github URL with your actual repository url if you pushed this code to GitHub, or upload the files via SCP/SFTP).*

---

## 🚀 4. Launching the Application

We have configured `docker-compose.yml` to include a **Caddy** service. Caddy will read the `DOMAIN` environment variable, request an SSL certificate from Let's Encrypt, and safely proxy traffic to NodeBB.

1. **Initialize persistent directories:**
   ```bash
   mkdir -p .docker/public/uploads .docker/database/mongo/data .docker/config .docker/build .docker/database/redis .docker/database/postgresql/data
   ```

2. **Start the environment with your domain:**
   Replace `your-domain.com` with the actual domain you pointed to the EC2 IP.

   ```bash
   sudo DOMAIN=your-domain.com docker compose --profile mongo up -d
   ```

### What happens now?
- Docker creates the native named volumes for your databases.
- Caddy spins up, reaches out to Let's Encrypt, and automatically registers/downloads your SSL certificates.
- NodeBB and Mongo start up.
- You can now visit `https://your-domain.com` and securely access your NodeBB dashboard!

---

## 🛠️ Troubleshooting HTTPS

If you cannot reach `https://your-domain.com`:
1. Check the Caddy logs to ensure Let's Encrypt validation succeeded:
   ```bash
   sudo docker compose logs caddy
   ```
2. Verify that ports 80 and 443 are open in your AWS Security Group.
3. Verify that your A Record correctly points to your Elastic IP.
