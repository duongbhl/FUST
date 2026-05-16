# Make necessary folders
mkdir -p .docker/public/uploads .docker/database/mongo/data .docker/config .docker/build .docker/database/redis .docker/database/postgresql/data

# Start nodebb
read -p "Enter your domain name (e.g. your-domain.com): " domain
sudo DOMAIN=$domain docker compose --profile mongo up -d
echo "NodeBB is running at https://$domain"
echo "Admin account: admin - Admin123!"
